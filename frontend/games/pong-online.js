import Ball from "./ball.js"
import Paddle from "./paddle.js"
import { getUserToken } from "../utils/userData.js"

const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")
 
export default class PongOnline {
    constructor(gameId) {
        this.start(gameId)
    }

    start(gameId) {
        this.ball = new Ball()
        this.paddle1 = new Paddle(1)
        this.paddle2 = new Paddle(2)
        this.score1 = 0
        this.score2 = 0
        this.pressedKeys = {}
        this.reset()
        this.draw()

        //event listeners
        this.handleKeydown = this.handleKeydown.bind(this)
        this.handleKeyUp = this.handleKeyUp.bind(this)

        window.addEventListener('keydown' , this.handleKeydown)
        window.addEventListener('keyup', this.handleKeyUp)

        // WebSocket connection setup
        this.gameId = gameId
        this.token = getUserToken().access
        this.socket = new WebSocket(`ws://${window.location.host}/ws/pong/${this.gameId}/?token=${this.token}`)

        this.socket.onmessage = this.handleOnmessage.bind(this)
        this.socket.onerror = this.handleOnerror.bind(this)
        this.socket.onclose = this.handleOnclose.bind(this)
    }

    draw() {
        this.ball.draw()
        this.paddle1.draw()
        this.paddle2.draw()
        this.drawScore()
    }

    reset() {
        this.ball.reset()
        this.paddle1.reset()
        this.paddle2.reset()
    }
    
    update () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.draw()
    }
    
    drawScore() {
        ctx.font = "30px Arial"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.fillText(this.score1, canvas.width / 4, 50)
        ctx.fillText(this.score2, canvas.width * 3 / 4, 50)
    }

    handleKeyUp(event) {
        if (this.pressedKeys[event.key]) {
            clearInterval(this.pressedKeys[event.key]);
            this.pressedKeys[event.key] = null;
        }
    }

    handleKeydown(event) {
        let action = null;
        if (!this.pressedKeys[event.key]) {
            if (event.key === "ArrowUp") {
                action = "up";
            } else if (event.key === "ArrowDown") {
                action = "down";
            }
        }
        if (action) {
            this.sendAction(action);
            this.pressedKeys[event.key] = setInterval(() => this.sendAction(action), 50);
        }
    }

    // Handle WebSocket messages
    handleOnmessage(event) {
        const data = JSON.parse(event.data);

        if (data.type === "possitions_update") {
            // Update paddle position from the server
            this.paddle1.y = data.paddle1_y;
            this.paddle2.y = data.paddle2_y;
            this.ball.x = data.ball_x;
            this.ball.y = data.ball_y;
            this.score1 = data.score1;
            this.score2 = data.score2;
            this.update();
        }
    }

    handleOnerror (error) {
        console.error("WebSocket error:", error);
    };

    handleOnclose () {
        alert("Connection closed by the server.");
    };

    sendAction(action) {
        this.socket.send(JSON.stringify({
            type: "paddle_action",
            action: action,
        }));
    }

    closeSocket () {
        if (this.socket)
            this.socket.close()
    }

    stop () {
        this.reset()
        this.closeSocket()
        window.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('keyup', this.handleKeyUp);
        location.hash = '/pong/onlineplayer'
    }
}