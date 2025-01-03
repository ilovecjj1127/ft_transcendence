import asyncio
from enum import Enum
import json
import math
import random

from channels.generic.websocket import AsyncWebsocketConsumer

from .constants import X_MAX, Y_MAX, INITIAL_VELOCITY, VELOCITY_STEP, BALL_RADIUS, \
    PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_INDENT, PADDLE_STEP


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
            await self.redis.set(f'game/{self.game_id}/paddle1', Action.STOP)
            self.keep_running = True
            asyncio.create_task(self.update_positions())
        else:
            await self.send_game_state()

    async def disconnect(self, close_code):
        if not self.game_id:
            return
        if self.is_player:
            await self.redis.delete(
                f'game/{self.game_id}',
                f'game/{self.game_id}/player',
                f'game/{self.game_id}/paddle1'
            )
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
        paddle_action = await self.redis.get(f'game/{self.game_id}/paddle1')
        if paddle_action == Action.STOP:
            await self.redis.set(f'game/{self.game_id}/paddle1', Action(action))
        elif paddle_action != action:
            await self.redis.set(f'game/{self.game_id}/paddle1', Action.STOP)

    def iniatialize_game(self) -> dict:
        game_state = {
            "paddle_position": (Y_MAX - PADDLE_HEIGHT) / 2
        }
        self.get_new_ball(game_state)
        return game_state

    async def update_positions(self):
        while (self.keep_running):
            game_state = json.loads(await self.redis.get(f'game/{self.game_id}'))
            await self.move_paddle(game_state)
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

    async def send_game_state(self, event: dict = {}):
        if event:
            game_state = event
        else:
            state_string = await self.redis.get(f'game/{self.game_id}')
            game_state = json.loads(state_string) if state_string is not None else {}
        paddle_position = game_state.get('paddle_position', (Y_MAX - PADDLE_HEIGHT) / 2)
        ball_x = game_state.get('ball_x', X_MAX / 2.0)
        ball_y = game_state.get('ball_y', Y_MAX / 2.0)
        await self.send(text_data=json.dumps({
            'type': 'possitions_update',
            'paddle_position': paddle_position,
            'ball_x': int(ball_x),
            'ball_y': int(ball_y)
        }))

    async def move_paddle(self, game_state: dict):
        paddle_position = game_state['paddle_position']
        paddle_action = await self.redis.get(f'game/{self.game_id}/paddle1')
        if paddle_action == Action.UP and paddle_position > 0:
            game_state['paddle_position'] = max(0, paddle_position - PADDLE_STEP)
        elif paddle_action == Action.DOWN and paddle_position < Y_MAX - PADDLE_HEIGHT:
            game_state['paddle_position'] = min(Y_MAX - PADDLE_HEIGHT, paddle_position + PADDLE_STEP)
        if paddle_action != Action.STOP:
            await self.redis.set(f'game/{self.game_id}/paddle1', Action.STOP)

    def move_ball(self, game_state: dict):
        ball_x, ball_y = game_state['ball_x'], game_state['ball_y']
        ball_x += game_state['ball_direction_x'] * game_state['ball_velocity']
        ball_y += game_state['ball_direction_y'] * game_state['ball_velocity']
        game_state['ball_velocity'] += VELOCITY_STEP
        if ball_y <= BALL_RADIUS or ball_y >= Y_MAX - BALL_RADIUS:
            game_state['ball_direction_y'] *= -1
            if ball_y <= BALL_RADIUS:
                ball_y = BALL_RADIUS * 2 - ball_y
            else:
                ball_y = (Y_MAX - BALL_RADIUS) * 2 - ball_y
        if self.is_bounced(ball_x, ball_y, game_state):
            game_state['ball_direction_x'] *= -1
            ball_x = (PADDLE_INDENT + PADDLE_WIDTH + BALL_RADIUS) * 2 - ball_x
        if ball_x <= BALL_RADIUS:
            self.get_new_ball(game_state)
            return
        elif ball_x >= X_MAX - BALL_RADIUS:
            game_state['ball_direction_x'] *= -1
            ball_x = (X_MAX - BALL_RADIUS) * 2 - ball_x
        game_state['ball_x'], game_state['ball_y'] = ball_x, ball_y

    def get_new_ball(self, game_state: dict):
        direction_x = 0
        while (abs(direction_x) < 0.2 or abs(direction_x) > 0.9):
            random_angle = random.uniform(0, 2 * math.pi)
            direction_x = math.cos(random_angle)
            direction_y = math.sin(random_angle)
        game_state["ball_x"] = X_MAX / 2.0
        game_state["ball_y"] = Y_MAX / 2.0
        game_state["ball_direction_x"] = direction_x
        game_state["ball_direction_y"] = direction_y
        game_state["ball_velocity"] = INITIAL_VELOCITY

    def is_bounced(self, ball_x: float, ball_y: float, game_state: dict) -> bool:
        paddle_position = game_state['paddle_position']
        x_bounce = PADDLE_INDENT + PADDLE_WIDTH + BALL_RADIUS
        if ball_x  <= x_bounce < game_state['ball_x'] \
                and paddle_position <= ball_y <= paddle_position + PADDLE_HEIGHT:
            return True
        return False
