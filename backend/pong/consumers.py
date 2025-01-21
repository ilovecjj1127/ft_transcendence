import asyncio
import json

from channels.generic.websocket import AsyncWebsocketConsumer

from .constants import X_MAX, Y_MAX, PADDLE_HEIGHT
from .services import PongService


class PongConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_id = ""

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.service = PongService(self.game_id, self.scope['redis_pool'])
        game_state = await self.service.connect(self.scope['user'])
        if not game_state:
            await self.close()
            return
        await self.channel_layer.group_add(
            self.game_id,
            self.channel_name
        )
        await self.accept()
        await self.send_game_state(game_state)
        if game_state.get("run_game", False):
            asyncio.create_task(self.broadcast_game_state())

    async def disconnect(self, close_code):
        if self.service.player_num not in (1, 2):
            return
        is_over = await self.service.disconnect()
        await self.channel_layer.group_discard(
            self.game_id,
            self.channel_name
        )
        if is_over:
            await self.service.finish_game()


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
            if game_state['score1'] == self.service.game.winning_score \
                    or game_state['score2'] == self.service.game.winning_score:
                break
        await self.service.finish_game(game_state)
        await self.close(code=4003)

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
