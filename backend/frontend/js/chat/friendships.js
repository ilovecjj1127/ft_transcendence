
const sendFriendshipRequestButton = document.getElementById("send-form-button")


sendFriendshipRequestButton.addEventListener('click', () => {
    // form.requestSubmit()
    // e.preventDefault()
	const username = document.querySelector("input[name='username']").value;
    // const message = document.querySelector("input[name='message']").value
    console.log("username; " + username)
	const body_data = JSON.stringify({ username: "jhon", message: "hi"})

	post(`http://${window.location.host}/api/users/friendship_request/`, body_data)
})

async function post(url, body_data) {

	// if (!checkToken()) return
	const refreshToken = localStorage.getItem('refresh_token')
    const accessToken = localStorage.getItem('access_token')

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: body_data
    });
	if (response.ok) {
        const data = await response.json()
        // localStorage.removeItem('access_token')
        // localStorage.removeItem('refresh_token')
        alert("Succesfully send friend request", data)
        // setTimeout( () => {
        //     window.location.reload()
        // }, 1000)
    } else {
        alert("failed, please try again")
    }
}