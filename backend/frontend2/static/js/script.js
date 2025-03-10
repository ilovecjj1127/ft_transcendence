// Update Loop

import Ball from "./Ball.js"
import Paddle from "./Paddle.js"
import loginFunction from "../js_requests/login-form.js"

const ball = new Ball(document.getElementById("ball"))

const paddleLeft = new Paddle(document.querySelector(".paddle.left"))
const paddleRight = new Paddle(document.querySelector(".paddle.right"))

const leftPlayerScoreElem = document.getElementById("left-player-score")
const rightPlayerScoreElem = document.getElementById("right-player-score")

const loginButton = document.getElementById("login-button")
const startButton = document.getElementById("start-game-button")
const pauseButton = document.getElementById("pause-game-button")
const exitButton = document.getElementById("exit-game-button")
const logoutButton = document.getElementById("log-out-button")

const loggedInStageBox = document.getElementById("logged-in-stage")
const loginStageBox = document.getElementById("login-stage")
const inGameStageBox = document.getElementById("in-game-stage")

export let start_game = false

let lastTime = null

loginButton.addEventListener("click", async function(event)
{
	const username = document.getElementById("username").value;
	console.log("input: " + username)
	console.log("Hi click");

	if (username)
	{
	
		const result = await loginFunction(event);
		console.log("result =  ", result)
		if (result == 0)
		{
			console.log("LoginF() == 0");

			loginStageBox.classList.add("hidden")
			loggedInStageBox.classList.remove("hidden")
		}
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

let pauzed_bool = false

pauseButton.addEventListener("click", () => 
{
	console.log("pauzing game! ")
	if (pauzed_bool == false)
	{
		start_game = false
		pauzed_bool = true
	}
	else
	{
		start_game = true
		pauzed_bool = false
	}
	// loginStageBox.classList.remove("hidden")
	// loggedInStageBox.classList.add("hidden")
});

logoutButton.addEventListener("click", () => 
{
	console.log("logging out! ")

	start_game = false

	loginStageBox.classList.remove("hidden")
	loggedInStageBox.classList.add("hidden")
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
