	
	
	
	document.getElementById("login-form").addEventListener("submit", async function(event) {
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
		} else {
			const error = await response.json();
			alert("Error: " + JSON.stringify(error));
		}
	} catch (err) {
		console.error("Network or server error:", err);
		alert("An error occurred. Please try again later.");
	}
});
