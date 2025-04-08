import asyncio
import json

from channels.generic.websocket import AsyncWebsocketConsumer

from .constants import X_MAX, Y_MAX, PADDLE_HEIGHT
from .services.mechanics import PongMechanics


class PongConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_id = ""

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.service = PongMechanics(self.game_id, self.scope['redis_pool'])
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
        if self.service.keep_running:
            asyncio.create_task(self.broadcast_game_state())

    async def disconnect(self, close_code):
        if self.service.player_num == 0:
            return
        await self.service.disconnect()
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
            if not game_state:
                return
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
        await self.channel_layer.group_send(
            self.game_id,
            {
                'type': 'send_disconnect_command',
                'message': 'End of the game',
                'winner': self.service.winner
            }
        )

    async def send_game_state(self, event: dict):
        game_state = event
        paddle1_y = game_state.get('paddle1_y', (Y_MAX - PADDLE_HEIGHT) / 2)
        paddle2_y = game_state.get('paddle2_y', (Y_MAX - PADDLE_HEIGHT) / 2)
        ball_x = game_state.get('ball_x', X_MAX / 2.0)
        ball_y = game_state.get('ball_y', Y_MAX / 2.0)
        try:
            await self.send(text_data=json.dumps({
                'type': 'possitions_update',
                'paddle1_y': paddle1_y,
                'paddle2_y': paddle2_y,
                'ball_x': int(ball_x),
                'ball_y': int(ball_y),
                'score1': game_state.get('score1', 0),
                'score2': game_state.get('score2', 0)
            }))
        except RuntimeError:
            pass

    async def send_disconnect_command(self, event: dict):
        try:
            await self.send(text_data=json.dumps({
                "type": "end_of_the_game",
                "winner": event.get('winner')
            }))
            await asyncio.sleep(0.2)
            await self.send(text_data=json.dumps({
                'type': 'disconnect',
                'message': event.get('message', '')
            }))
        except RuntimeError:
            pass
        await asyncio.sleep(0.8)
        await self.close(code=4004)
