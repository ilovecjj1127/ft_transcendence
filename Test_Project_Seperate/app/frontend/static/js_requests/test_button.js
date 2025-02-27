

const textbox = document.getElementById('myTextbox');
const testSecretInfoButton = document.getElementById("info-request-button")
const testSecretInfoTextbox = document.getElementById("secret-info-textbox")

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

// if TestButton == active 