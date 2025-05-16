//const SPEED_PADDLE_INCREASE = .01
const COMPUTER_PADDLE_SPEED = .03
const INITIAL_PADDLE_SPEED = 15

const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")


export default class Paddle {
    constructor (player) {
        this.player = player
        this.reset()
    }

    reset () {
        this.width = 10
        this.height = 100
        if (this.player == 1)
            this.x = 20
        else if (this.player == 2)
            this.x = canvas.width - this.width - 20
        this.y = canvas.height / 2 - this.height /2
        this.speed = INITIAL_PADDLE_SPEED
    }

    draw () {
        ctx.fillStyle = "white"
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }

    update(inputDir) {
        let nextY = this.y + inputDir * this.speed 
        if (nextY + this.height <= canvas.height && nextY > 0)
            this.y = nextY
        //this.speed += SPEED_PADDLE_INCREASE
        this.draw()
    }

    update_computer (delta, ball) {
        
        let nextY = this.y + (COMPUTER_PADDLE_SPEED * delta * (ball.y - this.y - this.height / 2))
        if (nextY + this.height <= canvas.height && nextY > 0)
            this.y = nextY
        this.draw()
    }

}