	
const loginButton = document.getElementById("login-button")
const loginStageBox = document.getElementById("login-stage")
// const loggedInStageBox = document.getElementById("logged-in-stage")
const inGameStageBox = document.getElementById("in-game-stage")


export default async function loginFunction(event)
{
	event.preventDefault(); // Prevent default form submission

	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;
	
	const payload = {
		username: username,
		password: password
	};

	try {
		const response = await fetch("http://127.0.0.1:8000/api/users/login/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		});
	
		if (response.ok) {
			const data = await response.json();
			alert("Login successful! Token: " + data.token);
			return 0;
		} else {
			const error = await response.json();
			alert("Error: " + JSON.stringify(error));
			return -1;
		}
	} catch (err) {
		console.error("Network or server error:", err);
		alert("An error occurred. Please try again later.");
		return -1;
	}
};


// 	loginButton.addEventListener("click", async function(event) {
// 	// document.getElementById("login-button").addEventListener("submit", async function(event) {
// 	console.log("Hi click");

// 	console.error("login-form Event listener works..");
// 	event.preventDefault(); // Prevent default form submission

// 	const username = document.getElementById("username").value;
// 	const password = document.getElementById("password").value;

// 	const payload = {
// 		username: username,
// 		password: password
// 	};

// 	try {
// 		const response = await fetch("http://127.0.0.1:8000/api/users/login/", {
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/json"
// 			},
// 			body: JSON.stringify(payload)
// 		});

// 		if (response.ok) {
// 			const data = await response.json();
// 			alert("Login successful! Token: " + data.token);
// 		} else {
// 			const error = await response.json();
// 			alert("Error: " + JSON.stringify(error));
// 		}
// 	} catch (err) {
// 		console.error("Network or server error:", err);
// 		alert("An error occurred. Please try again later.");
// 	}
// });
