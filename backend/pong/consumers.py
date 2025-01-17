import asyncio
import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .constants import X_MAX, Y_MAX, PADDLE_HEIGHT
from .services import PongService


class PongConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_id = ""
        self.game = None

    async def connect(self):
        player_num = await self._get_player_num()
        if player_num == 0:
            await self.close()
            return
        await self.channel_layer.group_add(
            self.game_id,
            self.channel_name
        )
        await self.accept()
        self.service = PongService(self.game_id, player_num, self.scope['redis_pool'])
        game_state = await self.service.connect()
        await self.send_game_state(game_state)
        if game_state.get("run_game", False):
            asyncio.create_task(self.broadcast_game_state())

    async def disconnect(self, close_code):
        if self.game is None:
            return
        players_count = await self.service.redis.decr(f'game/{self.game_id}/players_count')
        if players_count <= 0:
            await self.service.redis.delete(
                f'game/{self.game_id}',
                f'game/{self.game_id}/players_count',
                f'game/{self.game_id}/paddle1_action',
                f'game/{self.game_id}/paddle2_action'
            )
        await self.channel_layer.group_discard(
            self.game_id,
            self.channel_name
        )

    async def receive(self, text_data):
        if not self.service.player_num:
            return
        data = json.loads(text_data)
        action = data.get('action')
        await self.service.handle_action(action)
 
    async def broadcast_game_state(self):
        while (self.service.keep_running):
            game_state = await self.service.update_positions()
            await self.channel_layer.group_send(
                self.game_id,
                {
                    'type': 'send_game_state',
                    'paddle1_y': game_state['paddle1_y'],
                    'paddle2_y': game_state['paddle2_y'],
                    'ball_x': game_state['ball_x'],
                    'ball_y': game_state['ball_y'],
                    'score1': game_state['score1'],
                    'score2': game_state['score2']
                }
            )
            await asyncio.sleep(0.05)
            if game_state['score1'] == self.game.winning_score \
                    or game_state['score2'] == self.game.winning_score:
                break
        await self.finish_game(game_state)

    async def send_game_state(self, event: dict):
        game_state = event
        paddle1_y = game_state.get('paddle1_y', (Y_MAX - PADDLE_HEIGHT) / 2)
        paddle2_y = game_state.get('paddle2_y', (Y_MAX - PADDLE_HEIGHT) / 2)
        ball_x = game_state.get('ball_x', X_MAX / 2.0)
        ball_y = game_state.get('ball_y', Y_MAX / 2.0)
        await self.send(text_data=json.dumps({
            'type': 'possitions_update',
            'paddle1_y': paddle1_y,
            'paddle2_y': paddle2_y,
            'ball_x': int(ball_x),
            'ball_y': int(ball_y),
            'score1': game_state.get('score1', 0),
            'score2': game_state.get('score2', 0)
        }))

    async def _get_player_num(self) -> int:
        from games.models import Game

        user = self.scope['user']
        if user.is_anonymous:
            return 0
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        try:
            game = await Game.objects.select_related("player1", "player2").aget(id=self.game_id)
        except Game.DoesNotExist:
            return 0
        if game.status in ('pending', 'ready'):
            self.game = game
            if user == game.player1:
                return 1
            elif user == game.player2:
                return 2
        return 0

    async def finish_game(self, game_state: dict):
        self.game.status = "completed"
        self.game.score_player1 = game_state['score1']
        self.game.score_player2 = game_state['score2']
        if game_state['score1'] == self.game.winning_score:
            self.game.winner = self.game.player1
        elif game_state['score2'] == self.game.winning_score:
            self.game.winner = self.game.player2
        else:
            self.game.status = "interrupted"
        await database_sync_to_async(self.game.save)()
        await self.close(code=4003)
