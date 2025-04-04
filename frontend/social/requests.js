const sendFriendshipRequestButton = document.getElementById("send-form-button")

async function cancelRequest(request_id)
{
    const response = await fetch(`http://${window.location.host}/api/users/friendship_request/cancel/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({request_id})
    });
    console.log("PATCH: /api/users/friendship_request/cancel/, status: ", response.status)
    const response_data = await response.json()
    console.log("response_data: ", response_data)
    location.reload();
}

async function declineRequest(request_id)
{
    const response = await fetch(`http://${window.location.host}/api/users/friendship_request/decline/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({request_id})
    });
    const response_data = await response.json()
    console.log("response_data: ", response_data)
    location.reload();
}

async function acceptRequest(request_id)
{
    const response = await fetch(`http://${window.location.host}/api/users/friendship_request/accept/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({request_id})
    });
    console.log("PATCH: /api/users/friendship_request/accept, status: ", response.status)
    const response_data = await response.json()
    location.reload();
}

sendFriendshipRequestButton.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevents the page from reloading

	const requestBody = JSON.stringify({ username: document.querySelector("input[name='username']").value, message: document.querySelector("input[name='username']").value})
    console.log("hi send")
	post(`http://${window.location.host}/api/users/friendship_request/`, requestBody)
})

async function post(url, body_data) {

    const accessToken = getUserToken().access

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
        alert("Succesfully send friend request", data)
    } else {
        alert("failed, please try again")
    }
    location.reload();
}