//import java.time.LocalDataTime;

const loginButton = document.getElementById("login-button")
const loginStageBox = document.getElementById("login-stage")
const loggedInStageBox = document.getElementById("logged-in-stage")
const inGameStageBox = document.getElementById("in-game-stage")


/**
 * atob() is the function that decodes a string of data that has been encoded using Base64 encoding.
 */
function decode_jwt(token, index) {
    if (!token) {
        console.error("No token provided");
        return null;
    }
    const parts = token.split(".");
	console.log("Split token at " + index + "=" + parts[index]);

    if (parts.length !== 3) {
        console.error("Invalid JWT token format");
        return null;
    }
    try {
        const payload = parts[index];
        const paddedPayload = payload.replace(/-/g, "+").replace(/_/g, "/"); // Fix Base64 URL encoding
        const decoded = atob(paddedPayload); // Decode Base64
        return JSON.parse(decoded); // Convert JSON string to object
    } catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
}

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

export default async function loginFunction(event)
{
	// event.preventDefault(); // Prevent default form submission

	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;

	const payload = {
		username: username,
		password: password
	};
	console.log("hi from loginFunction");

	try {
		const response = await fetch("http://127.0.0.1:8000/api/login/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		});

		if (response.ok) {
			const data = await response.json();
			const data_refresh = data.access
			console.log("data_refresh:" + JSON.stringify(data_refresh))
			console.log("data_access:" + JSON.stringify(data.access))
			sessionStorage.setItem("access", data.access);
			sessionStorage.setItem("refresh", data.refresh);
			// document.cookie = "access=" + data.access + "refresh=" + data.refresh
			const token_decoded1 = decode_jwt(data_refresh, 0)
			const token_decoded2 = decode_jwt(data_refresh, 1)
			// console.log("expi; ", token_decoded2["exp"])
			const ExpDateToken = token_decoded2["exp"]
			// // const token_decoded3 = decode_jwt(data_refresh, 2)
			console.log("Login successful! Data: " + JSON.stringify(data) );
			console.log("Login successful! Token: " + JSON.stringify(data.token) + "Decoded; part 1:" + JSON.stringify(token_decoded1) + "2: " + JSON.stringify(token_decoded2) + "3: no");
			console.log("expi; ", token_decoded2["exp"])
			console.log("issued at; ", token_decoded2["iat"])

			const response2 = await fetch("http://127.0.0.1:8000/api/token/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",

					// "Authorization": msg
				},
				body: JSON.stringify(payload)
			});

			const data2 = await response2.json();
			console.log("data2:" + JSON.stringify(data2))

			// console.log("data in stringformat:" + JSON.stringify(data))
			// console.log("data['return_value'] in stringformat:" + data["return_value"])
			let date = new Date();
			console.log("time now = " + date)
			console.log(data.time)
			// date.getTime()
			const unixTimeStampNow = Math.floor(date.getTime() / 1000) //milliseconds to seconds

			console.log("unixTimeStampNow = ", unixTimeStampNow);
			console.log("diff Exp date token - now", ExpDateToken - unixTimeStampNow);

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
