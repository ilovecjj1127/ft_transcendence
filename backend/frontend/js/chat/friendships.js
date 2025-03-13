
const sendFriendshipRequestButton = document.getElementById("send-form-button")
import { showLoginModal } from "../menu/main.js"

let url;
let accessToken;
let friends;
let data;

window.addEventListener("load",  async function () {
    accessToken = localStorage.getItem("access_token")

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
            <div class="friend-name">${frienda}</div>
            <div class="friend-buttons">
                <button class="chat-friend">Chat</button>
                <button class="select-friend">Select</button>
            </div>
        `;
        friendList.appendChild(friendDiv);
        friendDiv.querySelector(".select-friend").addEventListener("click", () => openSelectFriend(frienda));
        friendDiv.querySelector(".chat-friend").addEventListener("click", () => openChattingBox(frienda));
    });
}

let switch_bool = true

function openChattingBox(frienda)
{
    console.log("hi openning chat box with:", frienda)
    const chattingBox = document.getElementById("chatting-box-id");
    if (chattingBox && switch_bool) {
        chattingBox.style.display = "block";
        document.getElementById("chat-user-name").textContent = frienda;
        switch_bool = false
    }
    else if (chattingBox && !switch_bool) {
        chattingBox.style.display = "none";
        switch_bool = true
    } else {
        console.error("Error: #chatting-box not found in the DOM.");
}}

let switch_bool2 = true

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

	post(`http://${window.location.host}/api/users/friendship_request/`, requestBody)
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
    location.reload();
}