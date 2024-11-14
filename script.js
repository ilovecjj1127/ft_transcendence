import Ball from "./Ball.js";

const ball = new Ball(document.getElementById("ball"))
const playerPaddle = new Paddle(document.getElementById("player-paddle"))
const conputerPaddle = new Paddle(document.getElementById("computer-paddle"))


let lastTime
function update(time) {
	if (lastTime != null) {
		const delta = time - lastTime
		// ball.update(delta)
	}
	lastTime = time
	window.requestAnimationFrame(update)
}

window.requestAnimationFrame(update)

