

const textbox = document.getElementById('myTextbox');
const testSecretInfoButton = document.getElementById("info-request-button")
const testSecretInfoTextbox = document.getElementById("secret-info-textbox")
const dataAboutCurrentUser = document.getElementById("data-about-current-user")
const dataAboutCurrentUserButton = document.getElementById("data-about-current-user-button")


let show_hide_bool = 0

testSecretInfoButton.addEventListener("click", async function(event)
{
	console.log("Hi click testSecretInfoButton");

	const access_token = sessionStorage.getItem("access")
	const msg = 'Bearer ' + access_token
	const response = await fetch("http://127.0.0.1:8000/api/secret-info/", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": msg
		},
		// body: ""
	});

	const data = await response.json()
	testSecretInfoTextbox.textContent = JSON.stringify(data);
	console.log("data from response; " + data);
	console.log("data from response stringified; " + JSON.stringify(data));
});

dataAboutCurrentUserButton.addEventListener("click", async function(event)
{
	console.log("Hi click testSecretInfoButton");

	const access_token = sessionStorage.getItem("access")
	const msg = 'Bearer ' + access_token
	const response = await fetch("http://127.0.0.1:8000/api/users/", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": msg
		},
		// body: "bobby"
	});

	const data = await response.json()
	dataAboutCurrentUser.textContent = JSON.stringify(data);
	console.log("data from response; " + data);
	console.log("data from response stringified; " + JSON.stringify(data));
});

dataAboutCurrentUserButton.addEventListener("click", async function(event)
{
	console.log("Hi click testSecretInfoButton");

	const access_token = sessionStorage.getItem("access")
	const msg = 'Bearer ' + access_token
	const response = await fetch("http://127.0.0.1:8000/api/users/", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": msg
		},
		// body: "bobby"
	});

	const data = await response.json()
	dataAboutCurrentUser.textContent = JSON.stringify(data);
	console.log("data from response; " + data);
	console.log("data from response stringified; " + JSON.stringify(data));
});


// function checkIfAccessTokenExpired(token)
// {
// 	console.log("checkIfAccessTokenExpired")
// 	console.log("token data: " + token)

// 	if (!token)
// 		return false;
// 	expiration_data = token["exp"]
// 	console.log("expiration data: " + expiration_data)

// 	if (expir)
// }

// if TestButton == active && access == expired
// 		hide content


// check if access token is expired
// request to refresh/token url with refresh token for new access token.
