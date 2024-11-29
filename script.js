import Ball from "./Ball.js";
import Paddle from "./Paddle.js";

const ball = new Ball(document.getElementById("ball"))
const playerPaddle = new Paddle(document.getElementById("player-paddle"))
const computerPaddle = new Paddle(document.getElementById("computer-paddle"))
const playerScoreElem = document.getElementById("player-score")
const computerScoreElem = document.getElementById("computer-score")

let lastTime
function update(time) {
	if (lastTime != null) {
		const delta = time - lastTime
		ball.update(delta, [playerPaddle.rect(), computerPaddle.rect()])
		computerPaddle.update(delta, ball.y)
		// const hue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hue"))

		// document.documentElement.style.setProperty("--hue", hue + delta * 0.01)

		if (isLose()) handleLose()
	}
	lastTime = time
	window.requestAnimationFrame(update)
}

function isLose() {
	const rect = ball.rect()
	return rect.right >= window.innerWidth || rect.left <= 0
}

function handleLose() {
	const rect = ball.rect()
	if (rect.right >= window.innerHeight) {
		playerScoreElem.textContent = parseInt(playerScoreElem.textContent) + 1
	} else {
		computerScoreElem.textContent = parseInt(computerScoreElem.textContent) + 1
	}
	ball.reset()
	computerPaddle.reset()
}

document.addEventListener("mousemove", e => {
	playerPaddle.position = (e.y / window.innerHeight) * 100
})

window.requestAnimationFrame(update)

document.getElementById('loginForm').addEventListener('submit', async (e) => {
	e.preventDefault(); // Prevent default form submission

	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;

	try {
		const response = await fetch('http://127.0.0.1:8000/api/users/login/', { // Update URL to match your Django endpoint
			method: 'POST',
			headers: {
				'Content-Type': 'application/json', // Specify JSON format
				'X-CSRFToken': getCookie('csrftoken') // Add CSRF token for security
			},
			body: JSON.stringify({ username, password })
		});

		if (response.ok) {
			const data = await response.json();
			alert(`Login successful: ${data.message}`);
		} else {
			const error = await response.json();
			alert(`Login failed: ${error.message}`);
		}
	} catch (err) {
		alert('An error occurred: ' + err.message);
	}
});

// Function to get CSRF token from cookies (Django's default setup)
function getCookie(name) {
	const cookies = document.cookie.split(';');
	for (let cookie of cookies) {
		cookie = cookie.trim();
		if (cookie.startsWith(name + '=')) {
			return cookie.substring(name.length + 1);
		}
	}
	return '';
}