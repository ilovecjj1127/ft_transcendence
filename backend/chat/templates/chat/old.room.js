let accessToken;

const token = localStorage.getItem('accessToken');
if (!token) {
	window.location.href = "/pong/login";
}
const roomId = "{{ room_id }}";
const chatSocket = new WebSocket(
	`ws://${window.location.host}/ws/chat/${roomId}/?token=${token}`
);
console.log(chatSocket.url);
console.log("err :",   JSON.stringify(chatSocket.error));
console.log("readyState :", chatSocket.readyState);

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
};
console.log("readyState :", chatSocket.readyState);

document.querySelector('#chat-message-submit').onclick = async function() {
	const messageInput = document.querySelector('#chat-message-input');
	const message = messageInput.value;

	chatSocket.send(JSON.stringify({
		'message': message
	}));
	console.log("data #chat-message-submit; ", message)

	messageInput.value = '';
};

document.querySelector('#create-chatroom').onclick = async function() {
	accessToken = localStorage.getItem("accessToken")

	const response = await fetch(`http://${window.location.host}/get_or_create/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${accessToken}`
		},
		body: JSON.stringify({ "username": "cathy" })  // Fixed object syntax
	});
};

document.querySelector('#create-chatroom-with-cathy').onclick = async function() {
	accessToken = localStorage.getItem("accessToken")

	const response = await fetch(`http://${window.location.host}/get_or_create/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${accessToken}`
		},
		body: JSON.stringify({ "username": "cathy" })  // Fixed object syntax
	});
};

document.querySelector('#create-chatroom-with-bob').onclick = async function() {
	accessToken = localStorage.getItem("access_token")

	const response = await fetch(`http://${window.location.host}/get_or_create/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${accessToken}`
		},
		body: JSON.stringify({ "username": "bob" })  // Fixed object syntax
	});
};

document.querySelector('#block-chatroom').onclick = async function() {
	accessToken = localStorage.getItem("access_token")

	const response = await fetch(`http://${window.location.host}/chat/block/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${accessToken}`
		},
		body: JSON.stringify({ "username": "bob" })  // Wrapped in an object
	});
};