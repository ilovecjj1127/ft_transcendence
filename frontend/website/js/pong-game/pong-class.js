import Ball from "./ball.js"
import Paddle from "./paddle.js"
import { getCanvasContent } from "../menu/select-menu.js"

const canvas = getCanvasContent().canvas
const ctx = getCanvasContent().ctx

export default class Game {
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

        this.reset()
        this.draw()
        //animationId = requestAnimationFrame((time) => Pong.update(time))
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

    update (time) {
        this.animationId = requestAnimationFrame((time) => this.update(time))
        ctx.clearRect(0,0, canvas.width, canvas.height)
        if (this.lastTime != null) {
            const delta = time - this.lastTime
            this.ball.update(delta, [this.paddle1, this.paddle2])
            this.paddle1.update(false)
            if (this.opponent == "multi")
                this.paddle2.update(true)
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
}



//update()