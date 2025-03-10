const INITIAL_VELOCITY = 0.00025
const ADD_VELOCITY = 0.0001


function randomNumberBetween(min, max)
{
	const val =  Math.random() * (max - min) + min;

	console.log(val);
	return val;
}



export default class Ball {
	constructor(ballElem) {
		this.ballElem = ballElem
		this.direction = { x: 0}
		this.reset()
	}

	get x() {
		return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--x"))
		// getComputedStyle gets css properties of element
	}

	set x(value) {
		this.ballElem.style.setProperty("--x", value)
	}

	get y() {
		return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--y"))
		// getComputedStyle gets css properties of element
	}

	set y(value) {
		this.ballElem.style.setProperty("--y", value)
	}

	rect() {
		return this.ballElem.getBoundingClientRect()
	}

	reset() {
		this.x = 50
		this.y = 50

		while (Math.abs(this.direction.x) <= 0.2 ||
			   Math.abs(this.direction.x) >= 0.9) {
			const heading = randomNumberBetween(0, 2 * Math.PI)
			this.direction = { x: Math.cos(heading), y: Math.sin(heading) }
		}
		// console.log("direction = " + this.direction)
	    this.velocity = INITIAL_VELOCITY
	}



	update(delta, paddlesRects)
	{
		this.velocity += ADD_VELOCITY;
		const additionx = this.direction.x * this.velocity * delta;
		const additiony = this.direction.y * this.velocity * delta;

		// console.log("%cdir x & y; " + this.direction.x + " " + this.direction.y + "\n velocity & delta: " + this.velocity + " " + delta, 'color: orange;')

		this.x = this.x + additionx;
		this.y = this.y + additiony;

		const rect = this.rect()

		// console.log("%caddition x & y: " + additionx + " " + additiony, 'color: green;')
		// console.log("%cposition: " + this.x + " " + this.y, 'color: blue;')
		// if (rect.bottom >= window.innerHeight || rect.top <= 0)
		// 	{ this.direction.y *= -1 }

		// if (paddleRects.some(r => isCollision(r, rect)))
		// 	{ this.direction.x *= -1 }

		if (rect.bottom >= window.innerHeight || rect.top <= 0)
		{
			// console.log("HIT BOUNDING BOX")
			this.direction.y *= -1
		}

		// this.direction.x *= -1
		// const playerPaddle = document.querySelector(".paddle.left"); // Select the left paddle

// /		const paddleRects = playerPaddle.getBoundingClientRect();

		if (isCollision(rect, paddlesRects[0])) {
			this.direction.x *= -1
		}
		else if (isCollision(rect, paddlesRects[1])) {
			this.direction.x *= -1
		}
		// if (rect.bottom >= window.innerHeight || rect.top <= 0)
		// 	// console.log("HIT BOUNDING BOX")
		// 	this.direction.x *= -1
	}
}

function isCollision(rect1, rect2) {
  return (
    rect1.left <= rect2.right &&
    rect1.right >= rect2.left &&
    rect1.top <= rect2.bottom &&
    rect1.bottom >= rect2.top
  )
}