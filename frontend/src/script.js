// Update Loop

import Ball from "./Ball.js"
import Paddle from "./Paddle.js"


const ball = new Ball(document.getElementById("ball"))

const paddleLeft = new Paddle(document.querySelector(".paddle.left"))
const paddleRight = new Paddle(document.querySelector(".paddle.right"))

const leftPlayerScoreElem = document.getElementById("left-player-score")
const rightPlayerScoreElem = document.getElementById("right-player-score")

const loginButton = document.getElementById("login-button")
const startButton = document.getElementById("start-game-button")
const pauseButton = document.getElementById("pause-game-button")
const exitButton = document.getElementById("exit-game-button")

const loggedInStageBox = document.getElementById("logged-in-stage")
const loginStageBox = document.getElementById("login-stage")
const inGameStageBox = document.getElementById("in-game-stage")

export let start_game = false

let lastTime = null

loginButton.addEventListener("click", () => 
{
	const username = document.getElementById("username").value;
	console.log("input: " + username)
	if (username)
	{
		loginStageBox.classList.add("hidden")
		loggedInStageBox.classList.remove("hidden")
	}
	else {
		alert("please enter username!")
	}
});

startButton.addEventListener("click", () => 
{
	console.log("starting game! ")

	start_game = true
	loggedInStageBox.classList.add("hidden")
	inGameStageBox.classList.remove("hidden")
});

exitButton.addEventListener("click", () => 
{
	console.log("exiting game! ")

	rightPlayerScoreElem.textContent = 0
	leftPlayerScoreElem.textContent = 0

	ball.reset()
	start_game = false
	inGameStageBox.classList.add("hidden")
	loggedInStageBox.classList.remove("hidden")
});

pauseButton.addEventListener("click", () => 
{
	console.log("pauzing game! ")

	start_game = false

	inGameStageBox.classList.add("hidden")
	loggedInStageBox.classList.remove("hidden")
});

function update(time)
{
	if (lastTime != null && start_game == true)
	{
		const delta = time - lastTime
		ball.update(delta, [paddleLeft.rect(), paddleRight.rect()])

		if (isLose())
			handleLose()
		// console.log(`[Elapsed: ${performance.now().toFixed(2)}ms] Ball update`);
	}
	lastTime = time
	window.requestAnimationFrame(update)
	//requestAnimationFrame() method tells the browser that you wish to perform an animation 
	//and requests that the browser call a specified function to update an animation before the next repaint.
}

function isLose()
{
	const rect = ball.rect()

	return rect.right >= window.innerWidth || rect.left <= 0
}

function handleLose()
{
	const rect = ball.rect()

	if (rect.right >= window.innerWidth)
		rightPlayerScoreElem.textContent = parseInt(rightPlayerScoreElem.textContent) + 1
	else
		leftPlayerScoreElem.textContent = parseInt(leftPlayerScoreElem.textContent) + 1
	ball.reset()
}

window.requestAnimationFrame(update)
