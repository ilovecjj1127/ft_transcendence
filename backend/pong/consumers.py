import asyncio
from enum import Enum
import json
import math
import random

from channels.generic.websocket import AsyncWebsocketConsumer

from .constants import INITIAL_PADDLE_POSITION, PADDLE_STEP, INITIAL_BALL_X, INITIAL_BALL_Y


class Action(str, Enum):
    UP = 'up'
    DOWN = 'down'
    STOP = 'stop'


class PongConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_id = ""
        self.is_player = False
        self.keep_running = False
        self.paddle_action = Action.STOP

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
            initial_state = self.iniatialize_game()
            await self.send_game_state(initial_state)
            await self.redis.set(f'game/{self.game_id}', json.dumps(initial_state))
            self.keep_running = True
            asyncio.create_task(self.update_positions())
        else:
            await self.send_game_state()

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
        if action not in (Action.UP, Action.DOWN):
            return
        if self.paddle_action == Action.STOP:
            self.paddle_action = Action(action)
        elif self.paddle_action != action:
            self.paddle_action = Action.STOP

    def iniatialize_game(self) -> dict:
        direction_x = 0
        while (abs(direction_x) < 0.2 or abs(direction_x) > 0.9):
            random_angle = random.uniform(0, 2 * math.pi)
            direction_x = math.cos(random_angle)
            direction_y = math.sin(random_angle)
        return {
            "paddle_position": INITIAL_PADDLE_POSITION,
            "ball_x": INITIAL_BALL_X,
            "ball_y": INITIAL_BALL_Y,
            "ball_direction_x": direction_x,
            "ball_direction_y": direction_y,
            "ball_velocity": 1
        }

    async def update_positions(self):
        while (self.keep_running):
            game_state = json.loads(await self.redis.get(f'game/{self.game_id}'))
            self.move_paddle(game_state)
            self.move_ball(game_state)
            await self.channel_layer.group_send(
                self.game_id,
                {
                    'type': 'send_game_state',
                    'paddle_position': game_state['paddle_position'],
                    'ball_x': game_state['ball_x'],
                    'ball_y': game_state['ball_y']
                }
            )
            await self.redis.set(f'game/{self.game_id}', json.dumps(game_state))
            await asyncio.sleep(0.05)

    # async def send_paddle_position(self, event={}):
    #     if 'paddle_position' in event:
    #         paddle_position = event['paddle_position']
    #     else:
    #         state_string = await self.redis.get(f'game/{self.game_id}')
    #         game_state = json.loads(state_string) if state_string is not None else {}
    #         paddle_position = game_state.get('paddle_position', INITIAL_PADDLE_POSITION)
    #     await self.send(text_data=json.dumps({
    #         'type': 'paddle_update',
    #         'paddle_position': paddle_position
    #     }))

    async def send_game_state(self, event: dict = {}):
        if event:
            game_state = event
        else:
            state_string = await self.redis.get(f'game/{self.game_id}')
            game_state = json.loads(state_string) if state_string is not None else {}
        paddle_position = game_state.get('paddle_position', INITIAL_PADDLE_POSITION)
        ball_x = game_state.get('ball_x', INITIAL_BALL_X)
        ball_y = game_state.get('ball_y', INITIAL_BALL_Y)
        await self.send(text_data=json.dumps({
            'type': 'possitions_update',
            'paddle_position': paddle_position,
            'ball_x': int(ball_x),
            'ball_y': int(ball_y)
        }))

    def move_paddle(self, game_state: dict):
        paddle_position = game_state['paddle_position']
        if self.paddle_action == Action.UP and paddle_position > 0:
            game_state['paddle_position'] = max(0, paddle_position - PADDLE_STEP)
        elif self.paddle_action == Action.DOWN and paddle_position < 100:
            game_state['paddle_position'] = min(100, paddle_position + PADDLE_STEP)
        self.paddle_action = Action.STOP

    def move_ball(self, game_state: dict):
        game_state['ball_x'] += game_state['ball_direction_x'] * game_state['ball_velocity']
        game_state['ball_y'] += game_state['ball_direction_y'] * game_state['ball_velocity']
