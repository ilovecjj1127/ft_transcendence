import Paddle from "./paddle.js"
import Ball from "./ball.js"
import { translations } from "../multilang/dictionary.js"
import { getLanguage } from "../utils/userData.js"

const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")
const overlay = document.querySelector('.overlay')
const fps = 60
const msPerFrame = 1000 / fps

export default class PongOffline {
    constructor(mode) {
        this.handleKeydown = this.handleKeydown.bind(this)
        this.handleKeyUp = this.handleKeyUp.bind(this)
        this.stop = this.stop.bind(this)
        this.destroy = this.destroy.bind(this);
        
        //event listeners
        window.addEventListener('keydown' , this.handleKeydown)
        window.addEventListener('keyup', this.handleKeyUp)
        this.start(mode)
    }

    start(mode) {
        this.ball = new Ball()
        this.paddle1 = new Paddle(1)
        this.paddle2 = new Paddle(2)
        this.score1 = 0
        this.score2 = 0
        this.lastTime = null
        this.animationId = null
        this.opponent = mode
        this.msPrev = window.performance.now()
        this.player1Direction = 0
        this.player2Direction = 0
        this.winScore = 10
        this.reset()
        this.draw()

    }

    draw() {
        this.ball.draw()
        this.paddle1.draw()
        this.paddle2.draw()
        this.drawScore()
        this.msPrev = window.performance.now()
    }

    reset() {
        this.ball.reset()
        this.paddle1.reset()
        this.paddle2.reset()
    }

    update (time) {
        this.animationId = requestAnimationFrame((time) => this.update(time))

        //fps control
        const msNow = window.performance.now()
        const msPassed = msNow - this.msPrev
        if (msPassed < msPerFrame)	return
    
        const excessTime = msPassed % msPerFrame
        this.msPrev = msNow - excessTime

        ctx.clearRect(0,0, canvas.width, canvas.height)
        if (this.lastTime != null) {
            const delta = time - this.lastTime
            this.ball.update(delta, [this.paddle1, this.paddle2])
            this.paddle1.update(this.getInputDirection().player1)
            if (this.opponent == "multi")
                this.paddle2.update(this.getInputDirection().player2)
            else
                this.paddle2.update_computer(delta, this.ball)
            this.drawScore()
            if (this.isLose()) this.handleLose()        
        }
        this.lastTime = time
    }
    
    isLose () {
        return this.ball.x + this.ball.radius >= canvas.width || this.ball.x - this.ball.radius <= 0
    }
    
    handleLose () {
        if (this.ball.x + this.ball.radius >= canvas.width)
            this.score1++
        else if (this.ball.x - this.ball.radius <= 0)
            this.score2++
        cancelAnimationFrame(this.animationId)
        this.reset()
        if (this.score1 == this.winScore || this.score2 == this.winScore ){
            ctx.clearRect(0,0, canvas.width, canvas.height)
            this.drawScore()
            this.drawEndGame()
            return
        }
        requestAnimationFrame((time) => this.update(time))
    }
    
    drawScore() {
        ctx.font = "30px Arial"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.fillText(this.score1, canvas.width / 4, 50)
        ctx.fillText(this.score2, canvas.width * 3 / 4, 50)
        ctx.font = "15px Arial"
        ctx.fillText("Win Score: " + this.winScore, canvas.width / 2, 30)
    }

    handleKeyUp(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            this.player2Direction = 0
        }
        if (e.key === 'w' || e.key === 's') {
            this.player1Direction = 0
        }
    }

    handleKeydown(e) {
        switch (e.key) {
            case 'ArrowUp' :
                this.player2Direction = -0.5
                break
            case 'ArrowDown' :
                this.player2Direction = 0.5
                break
            case 'w' :
                this.player1Direction = -0.5
                break
            case 's' :
                this.player1Direction = 0.5
            case ' ' :
                if (this.animationId == null) {
                    this.animationId = requestAnimationFrame((time) => this.update(time))
                }
                break
        }
    }

    getInputDirection() {
        return { player1 : this.player1Direction, player2 : this.player2Direction }
    }

    drawEndGame () {
        const winnerContainer = document.createElement('div')
        winnerContainer.id = 'end-msg-container'

        const winnerMessage = document.createElement('p')
        if (this.score1 == this.winScore)
            winnerMessage.innerText = translations[getLanguage()]['player1Won']
        else {
            if (this.mode == "multi")
                winnerMessage.innerText = translations[getLanguage()]['player2Won']
            else
                winnerMessage.innerText = translations[getLanguage()]['computerWon']    
        }
        winnerContainer.appendChild(winnerMessage)
        overlay.appendChild(winnerContainer)
    }

    stop () {
        this.destroy()
        location.hash = '/pong'
    }
    
    destroy () {
        window.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('keyup', this.handleKeyUp);
        cancelAnimationFrame(this.animationId)
        this.animationId = null;
        this.reset()
    }
}