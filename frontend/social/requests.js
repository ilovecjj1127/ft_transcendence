import { getUserToken } from "../utils/userData.js"

const sendFriendshipRequestButton = document.getElementById("send-form-button")
const sendRequestToChatButton = document.getElementById("chat-search-form-button")

const DEBUGPRINTS = true
const chatBox = document.querySelector('.chatbox-message-wrapper')
var chatSocket = null
import { getOrcreateChattingBox } from "@social/get_or_create_chatbox.js"
var friend = null
const chatboxMessageWrapper = document.querySelector('.chatbox-message-content')
import { OpenRoom } from "./chat/live_chatbox/open_chatbox.js"

// chat
export async function cancelRequest(request_id)
{
    const response = await fetch(`http://${window.location.host}/api/users/friendship_request/cancel/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
        body: JSON.stringify({request_id})
    });
    if (DEBUGPRINTS) console.log("PATCH: /api/users/friendship_request/cancel/, status: ", response.status)
    const response_data = await response.json()
    if (DEBUGPRINTS) console.log("response_data: ", response_data)
}

export async function rejectRequest(request_id)
{
    const response = await fetch(`http://${window.location.host}/api/users/friendship_request/reject/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
        body: JSON.stringify({request_id})
    });
    const response_data = await response.json()
    if (DEBUGPRINTS) console.log("response_data: ", response_data)
}

export async function acceptRequest(request_id)
{
    const response = await fetch(`http://${window.location.host}/api/users/friendship_request/accept/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
        body: JSON.stringify({request_id})
    });
    if (DEBUGPRINTS) console.log("PATCH: /api/users/friendship_request/accept, status: ", response.status)
    const response_data = await response.json()
}

// open room, chat
sendRequestToChatButton.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevents the page from reloading


    // make new or existing chatroom with user....
    const username = document.querySelector("input[name='username02']").value

    if (DEBUGPRINTS) console.log(username)

	// const requestBody = JSON.stringify({ username: document.querySelector("input[name='username02']").value, message: document.querySelector("input[name='username']").value})

    OpenRoom(friend = username)
    
    if (DEBUGPRINTS) console.log("after OpenRoom log")

	// const requestBody = JSON.stringify({ username: document.querySelector("input[name='username']").value, message: document.querySelector("input[name='username']").value})
    // if (DEBUGPRINTS) console.log("hi send")
	// post(`http://${window.location.host}/api/users/friendship_request/`, requestBody)
})


sendFriendshipRequestButton.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevents the page from reloading

	const requestBody = JSON.stringify({ username: document.querySelector("input[name='username']").value, message: document.querySelector("input[name='username']").value})
    if (DEBUGPRINTS) console.log("hi send")
    const statusDiv = document.getElementById('status_send_request');
	post(`http://${window.location.host}/api/users/friendship_request/`, requestBody, statusDiv)
})

async function post(url, body_data, statusDiv) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getUserToken().access}`
            },
            body: body_data
        });

        if (response.ok) {
            const data = await response.json();
            statusDiv.innerHTML = `<span style="color:green;">✅ Friend request sent successfully!</span>`;
        } else {
            const errorText = await response.text();
            statusDiv.innerHTML = `<span style="color:red;">❌ Failed: ${errorText}</span>`;
        }
    } catch (err) {
        statusDiv.innerHTML = `<span style="color:red;">❌ Error: ${err.message}</span>`;
    }

    // Optionally remove message after a few seconds
    setTimeout(() => {
        statusDiv.innerHTML = "<b>Status:</b>";
    }, 5000);
}
