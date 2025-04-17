import { showLoginModal } from "../utils/modals.js"
import { getUserToken } from "../utils/userData.js";
import openChattingBox from "./open_close_chat.js";
import openSelectFriend from "./select_friend_menu.js"
import { DEBUGPRINTS } from "../config.js"

let url;
let accessToken;
let friends;
let data;

document.addEventListener("DOMContentLoaded", async () =>  {

    // window.addEventListener("load",  async function () {
        accessToken = getUserToken().access
        console.log("hi windows addEventListener")

        if (!accessToken ) {
            console.log("Access token not found")
            showLoginModal()
            return;
        }
        url = `http://${window.location.host}/api/users/me/`
        data = await get_data(url);
        if (data)
            document.getElementById("username-text-home-page").innerHTML = data.username
        console.log("data", data)

        // populateFriends("friend-list", data)
        populateOutRequest("outgoing-requests", data)
        populateInRequest("incoming-requests", data)
});

async function get_data(url_parameter)
{
    const response = await fetch(url_parameter, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
    });
    const response_data = await response.json()
    if (response.status != 200)
        return null;

    return response_data;
}

function populateFriends(list_name, data) {
    const friendList = document.getElementById(list_name);
    // friendList.innerHTML = ""; // Clear existing content
    
    if (data == null)
        return
    const friends = data.friends

    friends.forEach(frienda => {

        const friendDiv = document.createElement("div");
        friendDiv.classList.add("friend");
        friendDiv.innerHTML = `
            <div class="friend">
                <div id="friend-name">${frienda}</div>
                <div class="friend-buttons">
                    <button id="chat-friend">Chat</button>
                    <button id="select-friend">Select</button>
                </div>
            </div>
        `;
        friendList.appendChild(friendDiv);
        friendDiv.querySelector("#select-friend").addEventListener("click", () => openSelectFriend(frienda));
        friendDiv.querySelector("#chat-friend").addEventListener("click", () => openChattingBox(frienda));
    });
}

function populateOutRequest(list_name, data) {
    const friendList = document.getElementById(list_name);
    friendList.innerHTML = ""; // Clear existing content
    if (DEBUGPRINTS) console.log("data populateOutRequest", data)

    if (data == null)
        return

    data.sent_requests.forEach(friend => {

        const li = document.createElement('li');
        li.classList.add('friend-item');

        const img = document.createElement('img');
        img.src = friend.img ? friend.img : "./media/default.jpeg";
        img.alt = friend.from_user;

        const nameTag = document.createElement('span');
        nameTag.textContent = `${friend.from_user}`;
        nameTag.classList.add('friend-name-tag');

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('friend-buttons');

        const acceptBtn = document.createElement('button');
        acceptBtn.textContent = 'Accept';
        acceptBtn.addEventListener('click', () => acceptRequest(friend.id));

        const declineBtn = document.createElement('button');
        declineBtn.textContent = 'Decline';
        declineBtn.addEventListener('click', () => declineRequest(friend.id));
    
        buttonContainer.appendChild(acceptBtn);
        buttonContainer.appendChild(declineBtn);

        li.appendChild(img);
        li.appendChild(nameTag);
        li.appendChild(buttonContainer);
        friendList.appendChild(li);
    });
}

function populateInRequest(list_name, data) {
    const friendList = document.getElementById(list_name);
    if (DEBUGPRINTS) console.log("data populateInRequest", data)

    friendList.innerHTML = ""; // Clear existing content
    if (data == null)
        return

    data.received_requests.forEach(friend => {
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
        friendList.getElementById("accept-request").addEventListener("click", () => acceptRequest(friend.id));
        friendList.getElementById("decline-request").addEventListener("click", () => declineRequest(friend.id));
    });
}
