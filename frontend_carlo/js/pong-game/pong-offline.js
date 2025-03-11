import Ball from "./ball.js"
import Paddle from "./paddle.js"
import { getCanvasContent } from "../menu/main.js"

const canvas = getCanvasContent().canvas
const ctx = getCanvasContent().ctx
const fps = 60
const msPerFrame = 1000 / fps

export default class GameOffline {
    constructor(mode) {
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
        this.reset()
        this.draw()

        //event listeners
        this.handleKeydown = this.handleKeydown.bind(this)
        this.handleKeyUp = this.handleKeyUp.bind(this)

        window.addEventListener('keydown' , this.handleKeydown)
        window.addEventListener('keyup', this.handleKeyUp)
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
        requestAnimationFrame((time) => this.update(time))
    }
    
    drawScore() {
        ctx.font = "30px Arial"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.fillText(this.score1, canvas.width / 4, 50)
        ctx.fillText(this.score2, canvas.width * 3 / 4, 50)
    }

    handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowUp' :
                this.player2Direction = 0
                break
            case 'ArrowDown' :
                this.player2Direction = 0
                break
            case 'w' :
                this.player1Direction = 0
                break
            case 's' :
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
        }
    }

    getInputDirection() {
        return { player1 : this.player1Direction, player2 : this.player2Direction }
    }
}



//update()