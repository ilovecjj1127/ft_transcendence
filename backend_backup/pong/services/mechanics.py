import json
import math

from .base_service import Action, PongServiceBase
from ..constants import X_MAX, Y_MAX, VELOCITY_STEP, BALL_RADIUS, \
    PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_INDENT, PADDLE_STEP, \
    LEFT_REBOUND, RIGHT_REBOUND, PADDLE_HALF_HEIGHT, BALL_ANGLE_MAX


class Ball:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

class PongMechanics(PongServiceBase):
    async def handle_action(self, action: str):
        if action not in (Action.UP, Action.DOWN):
            return
        key_paddle = f'game/{self.game_id}/paddle{self.player_num}_action'
        paddle_action = await self.redis.get(key_paddle)
        if paddle_action == Action.STOP:
            await self.redis.set(key_paddle, Action(action))
        elif paddle_action != action:
            await self.redis.set(key_paddle, Action.STOP)

    async def update_positions(self) -> dict:
        state_string = await self.redis.get(f'game/{self.game_id}')
        if not state_string:
            return {}
        game_state = json.loads(state_string)
        await self.move_paddle(game_state, 1)
        await self.move_paddle(game_state, 2)
        self.move_ball(game_state)
        await self.redis.set(f'game/{self.game_id}', json.dumps(game_state))
        if max(game_state['score2'], game_state['score1']) == self.game.winning_score:
            self.winner = 1 if game_state['score1'] == self.game.winning_score else 2
            self.keep_running = False
        return game_state

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
        ball = Ball(game_state['ball_x'], game_state['ball_y'])
        ball.x += game_state['ball_direction_x'] * game_state['ball_velocity']
        ball.y += game_state['ball_direction_y'] * game_state['ball_velocity']
        game_state['ball_velocity'] += VELOCITY_STEP
        if ball.y <= BALL_RADIUS or ball.y >= Y_MAX - BALL_RADIUS:
            game_state['ball_direction_y'] *= -1
            if ball.y <= BALL_RADIUS:
                ball.y = BALL_RADIUS * 2 - ball.y
            else:
                ball.y = (Y_MAX - BALL_RADIUS) * 2 - ball.y
        self.check_rebound(ball, game_state)
        if ball.x <= BALL_RADIUS or ball.x >= X_MAX - BALL_RADIUS:
            self.update_score(game_state, ball.x)
            return self.get_new_ball(game_state)
        game_state['ball_x'], game_state['ball_y'] = ball.x, ball.y

    def check_rebound(self, ball: Ball, game_state: dict):
        if LEFT_REBOUND < ball.x < RIGHT_REBOUND:
            return
        elif ball.x <= LEFT_REBOUND:
            paddle_y = game_state['paddle1_y']
            if game_state['ball_x'] > LEFT_REBOUND \
                    and paddle_y <= ball.y <= paddle_y + PADDLE_HEIGHT:
                self.change_ball_directions(ball.y, paddle_y, game_state)
                ball.x = LEFT_REBOUND * 2 - ball.x
                return
        else:
            paddle_y = game_state['paddle2_y']
            if game_state['ball_x'] < RIGHT_REBOUND \
                    and paddle_y <= ball.y <= paddle_y + PADDLE_HEIGHT:
                self.change_ball_directions(ball.y, paddle_y, game_state)
                ball.x = RIGHT_REBOUND * 2 - ball.x
                return
        if -BALL_RADIUS < ball.y - paddle_y < PADDLE_HALF_HEIGHT:
            self.check_rebound_paddle_top(ball, paddle_y, game_state)
        elif -BALL_RADIUS < paddle_y + PADDLE_HEIGHT - ball.y < PADDLE_HALF_HEIGHT:
            self.check_rebound_paddle_bottom(ball, paddle_y, game_state)

    def check_rebound_paddle_top(self, ball: Ball, paddle_y: float, game_state: dict):
        if paddle_y > 2 * BALL_RADIUS:
            if game_state['ball_direction_y'] > 0:
                game_state['ball_direction_y'] *= -1
            ball.y = paddle_y - BALL_RADIUS
        else:
            self.get_ball_out_of_trap(ball, game_state)

    def check_rebound_paddle_bottom(self, ball: Ball, paddle_y: float, game_state: dict):
        if paddle_y + PADDLE_HEIGHT < Y_MAX - 2 * BALL_RADIUS:
            if game_state['ball_direction_y'] < 0:
                game_state['ball_direction_y'] *= -1
            ball.y = paddle_y + PADDLE_HEIGHT + BALL_RADIUS
        else:
            self.get_ball_out_of_trap(ball, game_state)

    def get_ball_out_of_trap(self, ball: Ball, game_state: dict):
        if PADDLE_INDENT + PADDLE_WIDTH // 2 < ball.x < X_MAX // 2:
            self.change_ball_directions(ball.y, -1.0, game_state)
            ball.x = LEFT_REBOUND
        elif ball.x < X_MAX // 2:
            ball.x = PADDLE_INDENT - BALL_RADIUS
        elif ball.x < X_MAX - PADDLE_INDENT - PADDLE_WIDTH // 2:
            self.change_ball_directions(ball.y, -1.0, game_state)
            ball.x = RIGHT_REBOUND
        else:
            ball.x = X_MAX - PADDLE_INDENT + BALL_RADIUS

    def change_ball_directions(self, ball_y: float, paddle_y: float, game_state: dict):
        if paddle_y < 0:
            paddle_y = ball_y if ball_y < Y_MAX // 2 else ball_y - PADDLE_HEIGHT
        contact_point = (ball_y - paddle_y - PADDLE_HALF_HEIGHT) / PADDLE_HALF_HEIGHT
        sign_x = 1 if game_state["ball_direction_x"] < 0 else -1
        new_angle = math.radians(contact_point * BALL_ANGLE_MAX)
        game_state["ball_direction_x"] = math.cos(new_angle) * sign_x
        game_state["ball_direction_y"] = math.sin(new_angle)

    def update_score(self, game_state: dict, ball_x: float):
        if ball_x <= BALL_RADIUS:
            game_state['score2'] += 1
        elif ball_x >= X_MAX - BALL_RADIUS:
            game_state['score1'] += 1
