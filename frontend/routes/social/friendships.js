
const sendFriendshipRequestButton = document.getElementById("send-form-button")
import { showLoginModal } from "../../utils/modals.js"

let url;
let accessToken;
let friends;
let data;

window.addEventListener("load",  async function () {
    accessToken = localStorage.getItem("accessToken")

    if (!accessToken ) { //|| checkIfBackendKnowsUser()
        console.log("Access token not found")
        showLoginModal()
        return;
    } //testing purpose to be removed
    url = `http://${window.location.host}/api/users/me/`
    data = await get();
    populateFriends("friend-list", data.friends)
    populateInRequest("incoming-requests", data.received_requests)
    populateOutRequest("outgoing-requests", data.sent_requests)
});

async function get()
{
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
    });
    console.log("GET: api/users/me, status: ", response.status)
    const data_ini = await response.json()
    document.getElementById("username-text-home-page").innerHTML = data_ini.username
    console.log("data: ", data_ini)
    console.log("data fr: ", data_ini.friends)
    console.log("after")
    return data_ini;
}

function populateFriends(list_name, the_data) {
    console.log("hi from populateFriends; ")
    const friendList = document.getElementById(list_name);
    friendList.innerHTML = ""; // Clear existing content
    friends = the_data
    console.log("data fr2: ", friends)

    friends.forEach(frienda => {
        console.log("friend; ", frienda)
        const friendDiv = document.createElement("div");
        friendDiv.classList.add("friend");
        friendDiv.innerHTML = `
            <div class="friend">
                <div class="friend-name">${frienda}</div>
                <div class="friend-buttons">
                    <button class="create-chatroom-with-friend">Create chat</button>
                    <button class="chat-friend">Chat</button>
                    <button class="select-friend">Select</button>
                </div>
            </div>
        `;
        friendList.appendChild(friendDiv);
        friendDiv.querySelector(".create-chatroom-with-friend").addEventListener("click", () => getOrcreateChattingBox(frienda));
        friendDiv.querySelector(".select-friend").addEventListener("click", () => openSelectFriend(frienda));
        friendDiv.querySelector(".chat-friend").addEventListener("click", () => openChattingBox(frienda));
    });
}

let switch_bool = true


async function fetchChatroomData(id) {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        window.location.href = "/pong/login";  // Ensure the user is logged in
        return;
    }

    try {
        // Fetch the HTML content from the backend endpoint
        const response = await fetch(`http://127.0.0.1:8000/chat/room/${id}/`, {
            method: "GET", // Use GET for fetching data
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch chatroom data: ${response.statusText}`);
        }

        // Parse the response as HTML (assuming it returns HTML)
        const roomHTML = await response.text();

        // Create a temporary container to hold the fetched HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = roomHTML;

        // Now you can access the elements in this HTML structure
        const roomId = tempDiv.querySelector('#room_id').textContent;
        const roomName = tempDiv.querySelector('#chat-user-name').textContent;

        console.log("Room ID:", roomId);
        console.log("Room Name:", roomName);

        // You can now use this data to update your current page or elements
        // document.getElementById("room_id").textContent = roomId;
        // document.getElementById("chat-user-name").textContent = roomName;
        document.getElementById("chatting-box-id").innerHTML = roomHTML;
    } catch (error) {
        console.error('Error fetching chat room data:', error);
    }
}

var chatSocket = null

//adds chatscript to DOM and opens chattingBox. Or reverse
async function openChattingBox(frienda)
{
    console.log("hi openning chat box with:", frienda)

    let chattingBox = document.getElementById("chatting-box-id");

    console.log("hi openning chatbox:", chattingBox)

    const chat_box_id = await getOrcreateChattingBox(frienda)
    chattingBox.setAttribute("value", chat_box_id)

    console.log("hi openning chatbox:", chattingBox)

    if (chattingBox.getAttribute("value") && switch_bool) {
        
    document.getElementById("chat-user-name").textContent = frienda;
    switch_bool = false

    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = "/pong/login";
    }

    chatSocket = new WebSocket(
        `ws://127.0.0.1:8000/ws/chat/${chat_box_id}/?token=${token}`
    );

    console.log(chatSocket.url);
    console.log("err :",   JSON.stringify(chatSocket.error));
    console.log("readyState :", chatSocket.readyState);

    console.log("readyState :", chatSocket.readyState);
    setTimeout(() => {
        console.log("button yes; ", document.getElementById('chat-message-submit'))
    }, 100);

        document.querySelector('#chat-message-submit').onclick = async function() {
            const messageInput = document.querySelector('#chat-message-input');
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
        };

        chattingBox.style.display = "block";
    }
    else if (chattingBox.getAttribute("value") && !switch_bool) {

        if (chatSocket != null)
            chatSocket.close()
        const script = document.getElementById("chat-script");
        if (script) {
            script.remove(); // Remove script to clean up
        }
        chattingBox.style.display = "none";
        switch_bool = true
    } else {
        console.error("Error: #chatting-box not found in the DOM.");
    }
}

let switch_bool2 = true

async function getOrcreateChattingBox(frienda)
{
    console.log("hi create chat box with:", frienda)

	accessToken = localStorage.getItem("accessToken")
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

function openSelectFriend(frienda)
{
    console.log("hi openning openSelectFriend box with:", frienda)
    const SelectFriendgBox = document.getElementById("select-friend-box-id");
    if (SelectFriendgBox && switch_bool2) {
        SelectFriendgBox.style.display = "block";
        document.getElementById("friend-user-name").textContent = frienda;
        document.getElementById("remove-friend").addEventListener("click", () => removeFriend(frienda));
        switch_bool2 = false
    }
    else if (SelectFriendgBox && !switch_bool2) {
        SelectFriendgBox.style.display = "none";
        switch_bool2 = true
    } else {
        console.error("Error: #chatting-box not found in the DOM.");
}}

async function removeFriend(username)
{
    const response = await fetch(`http://${window.location.host}/api/users/remove_friend/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({username})
    });
    console.log("POST: /remove friend, status: ", response.status)
    const data_ini = await response.json()
    console.log("data: ", data_ini)
    console.log("data fr: ", data_ini.friends)
    console.log("after")
    // location.reload();
}


function populateOutRequest(list_name, the_data) {
    console.log("hi from populateFriends; ")
    const friendList = document.getElementById(list_name);
    friendList.innerHTML = ""; // Clear existing content
    friends = the_data
    console.log("data fr2: ", friends)

    friends.forEach(friend => {
        console.log("friend; ", friend)
        const friendDiv = document.createElement("div");
        friendDiv.classList.add("friend");
        friendDiv.innerHTML = `
            <div class="friend-name">${friend.to_user}, id: ${friend.id}</div>
            <div class="friend-buttons">
                <button class="cancel-request">Cancel</button>
            </div>
        `;
        friendList.appendChild(friendDiv);
        friendList.querySelector(".cancel-request").addEventListener("click", () => cancelRequest(friend.id));
    });
}

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
    const data_ini = await response.json()
    console.log("data: ", data_ini)
    console.log("data fr: ", data_ini.friends)
    console.log("after")
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
    console.log("PATCH: /api/users/friendship_request/decline, status: ", response.status)
    const data_ini = await response.json()
    console.log("data: ", data_ini)
    console.log("data fr: ", data_ini.friends)
    console.log("after")
    location.reload();
}

function populateInRequest(list_name, the_data) {
    console.log("hi from populateFriends; ")
    const friendList = document.getElementById(list_name);
    friendList.innerHTML = ""; // Clear existing content
    friends = the_data
    console.log("data fr2: ", friends)

    friends.forEach(friend => {
        console.log("friend; ", friend)
        const friendDiv = document.createElement("div");
        friendDiv.classList.add("friend");
        friendDiv.innerHTML = `
            <div class="friend-name">${friend.from_user}, id: ${friend.id}</div>
            <div class="friend-buttons">
                <button class="accept-request">Accept</button>
                <button class="decline-request">Decline</button>
            </div>
        `;
        friendList.appendChild(friendDiv);
        friendList.querySelector(".accept-request").addEventListener("click", () => acceptRequest(friend.id));
        friendList.querySelector(".decline-request").addEventListener("click", () => declineRequest(friend.id));
    });
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
    const data_ini = await response.json()
    console.log("data: ", data_ini)
    console.log("data fr: ", data_ini.friends)
    console.log("after")
    location.reload();
}

// const openChattingBox = document.getElementById("send-form-button")

// sendFriendshipRequestButton.addEventListener('click', async (event) => {
//     event.preventDefault(); // Prevents the page from reloading

// 	const requestBody = JSON.stringify({ username: document.querySelector("input[name='username']").value, message: document.querySelector("input[name='username']").value})

// 	post(`http://${window.location.host}/api/users/friendship_request/`, requestBody)
// })


sendFriendshipRequestButton.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevents the page from reloading

	const requestBody = JSON.stringify({ username: document.querySelector("input[name='username']").value, message: document.querySelector("input[name='username']").value})
    console.log("hi send")
	post(`http://${window.location.host}/api/users/friendship_request/`, requestBody)
})

async function post(url, body_data) {

	// if (!checkToken()) return
	// const refreshToken = localStorage.getItem('refresh_token')
    const accessToken = localStorage.getItem('accessToken')

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
    location.reload();
}