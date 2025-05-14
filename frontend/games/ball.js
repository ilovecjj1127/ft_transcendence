const INITIAL_SPEED = .2
const SPEED_BALL_INCREASE = .00001

const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

export default class Ball {
    constructor () {
        this.reset()
    }

    reset () {
        this.x =  canvas.width /2
        this.y = canvas.height /2
        this.radius = 10
        let validDirection = false;
        while (!validDirection) {
            const heading = randomNumberBetween(0, 2 * Math.PI);
            this.direction = { x: Math.cos(heading), y: Math.sin(heading) };
            // Validate direction (prevent x being too small)
            if (Math.abs(this.direction.x) > 0.2 && Math.abs(this.direction.x) < 0.9) {
                validDirection = true;
            }
        }
        this.speed = INITIAL_SPEED
    }

    draw () {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = "yellow"
        ctx.fill()
        ctx.closePath()
    }

    update (delta, Paddles) {
        this.x += this.direction.x * this.speed * delta
        this.y += this.direction.y * this.speed * delta
        this.speed += SPEED_BALL_INCREASE * delta
        
        //check wall collision
        if (this.y + this.radius >= canvas.height) {
            this.y = canvas.height - this.radius
            this.direction.y *= -1
        } 
        else if (this.y - this.radius <= 0) {
            this.y = this.radius
            this.direction.y *= -1
        }
        
        //check paddle collision
        Paddles.forEach(paddle => {
            if (isCollision(paddle, this)) {
                let relativeIntersectY = (this.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2)
    
                this.direction.y = relativeIntersectY
                this.direction.x *= -1
    
                if (this.direction.x > 0) {
                    this.x = paddle.x + paddle.width + this.radius
                } else {
                    this.x = paddle.x - this.radius
                }
            }
        })

        this.draw()
    }
}

function randomNumberBetween(min, max) {
	return Math.random() * (max - min) + min
}

function isCollision(paddle, ball) {
	return (
		ball.x + ball.radius >= paddle.x &&
		ball.x - ball.radius <= paddle.x + paddle.width &&
		ball.y + ball.radius >= paddle.y &&
		ball.y - ball.radius <= paddle.y + paddle.height
	)
}