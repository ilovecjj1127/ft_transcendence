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
        self.player_num = 0
        self.keep_running = False

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.redis = self.scope['redis_pool']
        await self.channel_layer.group_add(
            self.game_id,
            self.channel_name
        )
        await self.accept()
        player1 = await self.redis.get(f'game/{self.game_id}/player1')
        player2 = await self.redis.get(f'game/{self.game_id}/player2')
        if player1 is None and not self.scope['user'].is_anonymous:
            self.player_num = 1
            await self.redis.set(f'game/{self.game_id}/player1',
                                 self.scope['user'].username)
            initial_state = self.iniatialize_game()
            await self.send_game_state(initial_state)
            await self.redis.set(f'game/{self.game_id}', json.dumps(initial_state))
            await self.redis.set(f'game/{self.game_id}/paddle1_action', Action.STOP)
            await self.redis.set(f'game/{self.game_id}/paddle2_action', Action.STOP)
        elif player2 is None and not self.scope['user'].is_anonymous:
            self.player_num = 2
            await self.redis.set(f'game/{self.game_id}/player2',
                                 self.scope['user'].username)
            await self.send_game_state()
            # await self.group_send_player2_joined()
            self.keep_running = True
            asyncio.create_task(self.update_positions())
        else:
            await self.send_game_state()

    async def disconnect(self, close_code):
        if not self.game_id:
            return
        if self.player_num:
            await self.redis.delete(
                f'game/{self.game_id}',
                f'game/{self.game_id}/player1',
                f'game/{self.game_id}/player2',
                f'game/{self.game_id}/paddle1_action',
                f'game/{self.game_id}/paddle2_action'
            )
        await self.channel_layer.group_discard(
            self.game_id,
            self.channel_name
        )

    async def receive(self, text_data):
        if not self.player_num:
            return
        data = json.loads(text_data)
        action = data.get('action')
        if action not in (Action.UP, Action.DOWN):
            return
        key_paddle = f'game/{self.game_id}/paddle{self.player_num}_action'
        paddle_action = await self.redis.get(key_paddle)
        if paddle_action == Action.STOP:
            await self.redis.set(key_paddle, Action(action))
        elif paddle_action != action:
            await self.redis.set(key_paddle, Action.STOP)

    def iniatialize_game(self) -> dict:
        paddle_position = (Y_MAX - PADDLE_HEIGHT) / 2
        game_state = {
            "paddle1_y": paddle_position,
            "paddle2_y": paddle_position
        }
        self.get_new_ball(game_state)
        return game_state

    async def update_positions(self):
        while (self.keep_running):
            game_state = json.loads(await self.redis.get(f'game/{self.game_id}'))
            await self.move_paddle(game_state, 1)
            await self.move_paddle(game_state, 2)
            self.move_ball(game_state)
            await self.channel_layer.group_send(
                self.game_id,
                {
                    'type': 'send_game_state',
                    'paddle1_y': game_state['paddle1_y'],
                    'paddle2_y': game_state['paddle2_y'],
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
        paddle1_y = game_state.get('paddle1_y', (Y_MAX - PADDLE_HEIGHT) / 2)
        paddle2_y = game_state.get('paddle2_y', (Y_MAX - PADDLE_HEIGHT) / 2)
        ball_x = game_state.get('ball_x', X_MAX / 2.0)
        ball_y = game_state.get('ball_y', Y_MAX / 2.0)
        await self.send(text_data=json.dumps({
            'type': 'possitions_update',
            'paddle1_y': paddle1_y,
            'paddle2_y': paddle2_y,
            'ball_x': int(ball_x),
            'ball_y': int(ball_y)
        }))

    async def group_send_player2_joined(self):
        await self.channel_layer.group_send(
            self.game_id,
            {'type': 'send_player2_joined'}
        )

    async def send_player2_joined(self, event: dict = {}):
        await self.send(text_data=json.dumps({
            'type': "player2_joined"
        }))

    async def move_paddle(self, game_state: dict, paddle_num: int):
        paddle_position = game_state[f'paddle{paddle_num}_y']
        paddle_action = await self.redis.get(f'game/{self.game_id}/paddle{paddle_num}_action')
        if paddle_action == Action.UP and paddle_position > 0:
            game_state[f'paddle{paddle_num}_y'] = max(0, paddle_position - PADDLE_STEP)
        elif paddle_action == Action.DOWN and paddle_position < Y_MAX - PADDLE_HEIGHT:
            game_state[f'paddle{paddle_num}_y'] = min(Y_MAX - PADDLE_HEIGHT,
                                                      paddle_position + PADDLE_STEP)
        if paddle_action != Action.STOP:
            await self.redis.set(f'game/{self.game_id}/paddle{paddle_num}_action', Action.STOP)

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
        ball_x = self.check_rebound(ball_x, ball_y, game_state)
        if ball_x <= BALL_RADIUS or ball_x >= X_MAX - BALL_RADIUS:
            return self.get_new_ball(game_state)
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

    def check_rebound(self, ball_x: float, ball_y: float, game_state: dict) -> float:
        paddle1_y = game_state['paddle1_y']
        paddle2_y = game_state['paddle2_y']
        left_rebound = PADDLE_INDENT + PADDLE_WIDTH + BALL_RADIUS
        right_rebound = X_MAX - left_rebound
        if ball_x  <= left_rebound < game_state['ball_x'] \
                and paddle1_y <= ball_y <= paddle1_y + PADDLE_HEIGHT:
            game_state['ball_direction_x'] *= -1
            return left_rebound * 2 - ball_x
        elif ball_x  >= right_rebound > game_state['ball_x'] \
                and paddle2_y <= ball_y <= paddle2_y + PADDLE_HEIGHT:
            game_state['ball_direction_x'] *= -1
            return right_rebound * 2 - ball_x
        return ball_x
