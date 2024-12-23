from enum import Enum
import json

from channels.generic.websocket import AsyncWebsocketConsumer

from .constants import INITIAL_PADDLE_POSITION, PADDLE_STEP


class Action(str, Enum):
    UP = 'up'
    DOWN = 'down'


class PongConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_id: str = ""
        self.is_player: bool = False

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.redis = self.scope['redis_pool']
        await self.channel_layer.group_add(
            self.game_id,
            self.channel_name
        )
        await self.accept()
        key_player = f'game/{self.game_id}/player'
        player = await self.redis.get(key_player)
        if player is None and not self.scope['user'].is_anonymous:
            self.is_player = True
            await self.redis.set(key_player, self.scope['user'].username)
            initial_state = {
                "paddle_position": INITIAL_PADDLE_POSITION
            }
            await self.send_paddle_position(initial_state)
            await self.redis.set(f'game/{self.game_id}', json.dumps(initial_state))
        else:
            await self.send_paddle_position()

    async def disconnect(self, close_code):
        if not self.game_id:
            return
        if self.is_player:
            await self.redis.delete(f'game/{self.game_id}', f'game/{self.game_id}/player')
        await self.channel_layer.group_discard(
            self.game_id,
            self.channel_name
        )

    async def receive(self, text_data):
        if not self.is_player:
            return
        data = json.loads(text_data)
        action = data.get('action')
        if action is None:
            return
        game_state = json.loads(await self.redis.get(f'game/{self.game_id}'))
        paddle_position, is_changed = self.move_paddle(game_state, action)
        if not is_changed:
            return
        await self.channel_layer.group_send(
            self.game_id,
            {
                'type': 'send_paddle_position',
                'paddle_position': paddle_position
            }
        )
        await self.redis.set(f'game/{self.game_id}', json.dumps(game_state))

    async def send_paddle_position(self, event={}):
        if 'paddle_position' in event:
            paddle_position = event['paddle_position']
        else:
            state_string = await self.redis.get(f'game/{self.game_id}')
            game_state = json.loads(state_string) if state_string is not None else {}
            paddle_position = game_state.get('paddle_position', INITIAL_PADDLE_POSITION)
        await self.send(text_data=json.dumps({
            'type': 'paddle_update',
            'paddle_position': paddle_position
        }))

    def move_paddle(self, game_state: dict, action: Action) -> tuple[int, bool]:
        paddle_position = game_state['paddle_position']
        if action == Action.UP and paddle_position > 0:
            paddle_position = max(0, paddle_position - PADDLE_STEP)
        elif action == Action.DOWN and paddle_position < 100:
            paddle_position = min(100, paddle_position + PADDLE_STEP) 
        else:
            return paddle_position, False
        game_state['paddle_position'] = paddle_position
        return paddle_position, True

