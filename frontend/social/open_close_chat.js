import { showLoginModal } from "../utils/modals.js";
import { getUserToken } from "../utils/userData.js";

let switch_bool = true
var chatSocket = null

// console.log(chatSocket.url);

export default async function openChattingBox(frienda)
{
    const chat_box_id = await getOrcreateChattingBox(frienda)

    let chattingBox = document.getElementById("chatting-box-id");
    chattingBox.setAttribute("value", chat_box_id)

    if (chattingBox.getAttribute("value") && switch_bool) {
        
        switch_bool = false
        const token = getUserToken().access

        if (!token) {
            showLoginModal()
            return
        }
        chatSocket = new WebSocket(
            `ws://127.0.0.1:8000/ws/chat/${chat_box_id}/?token=${token}`
        );
        document.getElementById("chat-user-name").textContent = frienda;
        document.getElementById('chat-log').innerHTML = ""

        setChatSocketEventFunctions()

        chattingBox.style.display = "block";
    }
    else if (chattingBox.getAttribute("value") && !switch_bool)
    {
        if (chatSocket != null)
        {
            chatSocket.close()
            console.log("close called")
        }
        chattingBox.style.display = "none";
        switch_bool = true
    } else {
        console.error("Error: #chatting-box not found in the DOM.");
    }
}

function setChatSocketEventFunctions()
{
    document.getElementById('chat-message-submit').onclick = async function() {
        const messageInput = document.getElementById('chat-message-input');
        const message = messageInput.value;

        chatSocket.send(JSON.stringify({
            'message': message
        }));
        console.log("data #chat-message-submit; ", message)

        messageInput.value = '';
    };
    chatSocket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log("data onmessage; ", data.message)
        document.querySelector('#chat-log').innerHTML += `<p>${data.message}</p>`;
    };
    chatSocket.onclose = function(event) {
        if (event.code === 1006) {
            alert(`Unauthorized: please log in first, reason; ${event.reason}`);
        } else if (event.code === 4000) {
            alert(`Chat room ${roomId} does not exist.`);
        } else if (event.code === 4001) {
            alert(`You are not allowed to enter chat room ${roomId}`);
        } else {
            console.error('Chat socket closed unexpectedly');
        }
        console.log(".onclose called")
    };
}


async function getOrcreateChattingBox(frienda)
{
    console.log("hi create chat box with:", frienda)

	const accessToken = getUserToken().access
	console.log("accessToken: ", accessToken)

	const response = await fetch(`http://${window.location.host}/api/chat/get_or_create/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${accessToken}`
		},
		body: JSON.stringify({ "username": frienda })  // Fixed object syntax
	});

    const data = await response.json();  // ✅ Parse JSON
    console.log("response id: ", data["chat_room_id"]);  // ✅ Access property
    return data["chat_room_id"];
};