
// script to move playerPaddle

let lastEventTime = 0;  // Timestamp of the last event
let eventCount = 0;     // Number of events triggered
const step = 10;
let currentPosition = 50
const playerPaddle = document.querySelector(".paddle.right"); // Select the left paddle

import { start_game } from "./game_script.js";
// const start_game = false


document.addEventListener('keydown', function(event) {
	const currentTime = Date.now();  // Get current time in milliseconds
	const timeDifference = currentTime - lastEventTime;  // Time between last event and this one
	// const currentPosition = parseFloat(getComputedStyle(playerPaddle).getPropertyValue("--position")) || 50;

	if (start_game == false)
		return;
	event.preventDefault()

	// console.log("%cevent press key e.key= " + e.key , 'color: blue')
	// console.log("%c pos = " + paddlePos, 'color: red');
	// console.log("%c value = " + event.key, 'color: red');
	console.log("%c time diff: " + timeDifference, 'color: red');
	// eventCount++;
	if (event.key === "ArrowUp")
	{
		currentPosition = currentPosition - step;
		// console.log("%c new pos = " + paddlePos, 'color: red');
	}
	else if (event.key === "ArrowDown")
	{
		currentPosition = currentPosition + step;
		// console.log("%c new pos = " + paddlePos, 'color: red');
	}
	playerPaddle.style.setProperty("--position", currentPosition);
	// playerPaddle.style.top = '${paddlePos}%';
	
	// Increment the event count

	// Display key and code information
	
	const output = document.getElementById('output');
	output.textContent = `Key: ${event.key}, Code: ${event.code}`;
	// Display time difference and events per second
	const speedOutput = document.getElementById('speed-output');
	if (timeDifference > 0) {
		const eventsPerSecond = 1000 / timeDifference; // Convert milliseconds to events per second
		speedOutput.textContent = `Speed: ${eventsPerSecond.toFixed(2)} events per second`;
	}
	// Update last event time
	lastEventTime = currentTime;
});