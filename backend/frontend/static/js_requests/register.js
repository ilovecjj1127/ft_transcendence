	
const loginButton = document.getElementById("login-button")
const loginStageBox = document.getElementById("login-stage")
// const loggedInStageBox = document.getElementById("logged-in-stage")
const inGameStageBox = document.getElementById("in-game-stage")
const registerButton = document.getElementById("register-button")

registerButton.addEventListener("click", async function(event)
{
	const username = document.getElementById("username").value;
	console.log("input: " + username)
	console.log("Hi click register Button");

	if (username)
	{
		const result = await registerFunction(event);
		console.log("result =  ", result)
		// if (result == 0)
		// {
		// 	console.log("LoginF() == 0");
		// 	loginStageBox.classList.add("hidden")
		// 	loggedInStageBox.classList.remove("hidden")
		// }
	}
	else {
		alert("registering failed!")
	}
});


export default async function registerFunction(event)
{
	// event.preventDefault(); // Prevent default form submission

	const username = document.getElementById("username").value;
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;
	const payload = {
		username: username,
		email: email,
		password: password,
		password2: password
	};
	console.log("hi from registerFunction");
	try {
		const response = await fetch("http://127.0.0.1:8000/api/register/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		});
		if (response.ok) {
			const data = await response.json();
			// const token_copy = data.token
			// const token_decoded1 = decode_jwt(token_copy, 0)
			// const token_decoded2 = decode_jwt(token_copy, 1)
			// const token_decoded3 = decode_jwt(token_copy, 2)
			// alert("Login successful! Token: " + data );
			// alert("Login successful! Token: " + data.token + "Decoded; part 1:" + token_decoded1 + "2: " + token_decoded2 + "3: " + token_decoded3);
			console.log("data:" + data)
			// sessionStorage.setItem(data)
			console.log("data in stringformat:" + JSON.stringify(data))
			// if (data["return_value"] == 0)
			// 	return 0;
			// else
			// 	return 1;
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
