import Ball from "./ball.js"
import Paddle from "./paddle.js"
import { getUserToken, getLanguage } from "../utils/userData.js"
import { checkToken } from "../utils/token.js"
import { translations } from "../multilang/dictionary.js"

const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")
const overlay = document.querySelector('.overlay')
 
export default class PongOnline {
    constructor() {
        const gameInfo = JSON.parse(localStorage.getItem("gameInfo"))
        this.start(gameInfo)
        this.stop = this.stop.bind(this)
        this.destroy = this.destroy.bind(this);
        this.winScore = gameInfo.winScore
        this.player1 = gameInfo.player1
        this.player2 = gameInfo.player2
        this.hash = gameInfo.hash
    }

    async start(gameInfo) {
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

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
        }

        // WebSocket connection setup
        this.gameId = gameInfo.gameId
        const isTokenValid = await checkToken()
        if (isTokenValid) {
            this.token = getUserToken().access
            this.socket = new WebSocket(`ws://${window.location.host}/ws/pong/${this.gameId}/?token=${this.token}`)
        }

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
        ctx.fillText(this.score1, canvas.width / 4, 60)
        ctx.fillText(this.score2, canvas.width * 3 / 4, 60)
        ctx.font = "20px Arial"
        if (this.player1) ctx.fillText(this.player1, canvas.width /4, 30)
        if (this.player2) ctx.fillText(this.player2, canvas.width * 3 / 4, 30)
        
        ctx.font = "15px Arial"
        ctx.fillText("Win Score: " + this.winScore, canvas.width / 2, 30)
        
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
            if (this.score1 == this.winScore || this.score2 == this.winScore)
                this.drawEndGame
            else
                this.update();
        }

        if (data.type == "disconnect") {
            //alert(data.message)
        }
        
        if (data.type == "end_of_the_game")
        {
            window.removeEventListener('keydown', this.handleKeydown);
            window.removeEventListener('keyup', this.handleKeyUp);
            ctx.clearRect(0,0, canvas.width, canvas.height)
            this.drawEndGame(data.winner)
        }
    }

    drawEndGame (winner) {
        const winnerContainer = document.createElement('div')
        winnerContainer.id = 'end-msg-container'

        const winnerMessage = document.createElement('p')
        if (!this.player1) this.player1 = "Player 1"
        if (!this.player2) this.player2 = "Player 2"
        if (winner == '1')
            winnerMessage.innerText = translations[getLanguage()]['winnerIs'] + this.player1
        else
            winnerMessage.innerText = translations[getLanguage()]['winnerIs'] + this.player2
        winnerContainer.appendChild(winnerMessage)
        overlay.appendChild(winnerContainer)
    }

    handleOnerror (error) {
        console.error("WebSocket error:", error);
        window.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('keyup', this.handleKeyUp);
        ctx.clearRect(0,0, canvas.width, canvas.height)
        const errorContainer = document.createElement('div')
        errorContainer.id = 'end-msg-container'
        const errorMessage = document.createElement('p')
        errorMessage.innerText = translations[getLanguage()]['inGameError']
        errorContainer.appendChild(errorMessage)
        overlay.appendChild(errorContainer)
    };

    handleOnclose () {
        console.log("Connection closed by the server.");
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
        this.destroy()
        location.hash = this.hash
    }
    
    destroy () {
        this.reset()
        this.closeSocket()
        window.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
}