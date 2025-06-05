from enum import Enum
import json
import math
import random

from channels.db import database_sync_to_async

from ..constants import X_MAX, Y_MAX, INITIAL_VELOCITY, PADDLE_HEIGHT
from ..utils import notify_about_player_waiting_in_game


class Action(str, Enum):
    UP = 'up'
    DOWN = 'down'
    STOP = 'stop'


class PongServiceBase:
    def __init__(self, game_id, redis):
        self.game_id = game_id
        self.game = None
        self.redis = redis
        self.player_num = 0
        self.keep_running = False
        self.winner = 0

    async def connect(self, user) -> dict:
        self.player_num = await self._get_player_num(user)
        if self.player_num == 0:
            return {}
        connected_players = await self.redis.lrange(f'game/{self.game_id}/connected_players', 0, -1)
        if not connected_players:
            game_state = self.iniatialize_game()
            await self.redis.set(f'game/{self.game_id}', json.dumps(game_state))
            await self.redis.set(f'game/{self.game_id}/paddle1_action', Action.STOP)
            await self.redis.set(f'game/{self.game_id}/paddle2_action', Action.STOP)
            await notify_about_player_waiting_in_game(self.game_id, self._get_opponent(), user.username)
        elif str(self.player_num) not in connected_players:
            game_state = json.loads(await self.redis.get(f'game/{self.game_id}'))
            await self.start_game()
        else:
            self.player_num = 0
            return {}
        await self.redis.rpush(f'game/{self.game_id}/connected_players', self.player_num)
        return game_state
    
    async def disconnect(self):
        await self.redis.lrem(f'game/{self.game_id}/connected_players', 1, self.player_num)
        connected_players = await self.redis.lrange(f'game/{self.game_id}/connected_players', 0, -1)
        if not connected_players:
            state_string = await self.redis.get(f'game/{self.game_id}')
            if state_string:
                game_state = json.loads(state_string)
                await self.finish_pong(game_state)

    async def _get_player_num(self, user) -> int:
        from games.models import Game

        if user.is_anonymous:
            return 0
        try:
            game = await Game.objects.select_related('player1', 'player2').aget(id=self.game_id)
        except Game.DoesNotExist:
            return 0
        if game.status in ('pending', 'ready', 'in_progress'):
            self.game = game
            if user == game.player1:
                return 1
            elif user == game.player2:
                return 2
        return 0

    def iniatialize_game(self) -> dict:
        paddle_position = (Y_MAX - PADDLE_HEIGHT) / 2
        game_state = {
            "paddle1_y": paddle_position,
            "paddle2_y": paddle_position,
            "score1": 0,
            "score2": 0
        }
        self.get_new_ball(game_state)
        return game_state

    async def start_game(self):
        if self.game.status != 'ready':
            return
        self.keep_running = True
        self.game.status = 'in_progress'
        await database_sync_to_async(self.game.save)()

    async def finish_pong(self, game_state: dict):
        from games.services.games import GameService

        try:
            finish_game = database_sync_to_async(GameService.finish_game)
            self.game = await finish_game(
                game_id=self.game_id, 
                new_score_player1=game_state['score1'],
                new_score_player2=game_state['score2']
            )
        except ValueError:
            return
        await self.redis.delete(
            f'game/{self.game_id}',
            f'game/{self.game_id}/connected_players',
            f'game/{self.game_id}/paddle1_action',
            f'game/{self.game_id}/paddle2_action'
        )

    def get_new_ball(self, game_state: dict):
        direction_x = 0
        while (abs(direction_x) < 0.3):
            random_angle = random.uniform(0, 2 * math.pi)
            direction_x = math.cos(random_angle)
            direction_y = math.sin(random_angle)
        game_state["ball_x"] = X_MAX / 2.0
        game_state["ball_y"] = Y_MAX / 2.0
        game_state["ball_direction_x"] = direction_x
        game_state["ball_direction_y"] = direction_y
        game_state["ball_velocity"] = INITIAL_VELOCITY

    def _get_opponent(self) -> str:
        if self.game.player1 is None or self.game.player2 is None:
            return ""
        if self.player_num == 1:
            return self.game.player2.username
        else:
            return self.game.player1.username
