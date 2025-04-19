import { showLoginModal } from "../utils/modals.js"
import { getUserToken } from "../utils/userData.js";
import openChattingBox from "./open_close_chat.js";
import openSelectFriend from "./select_friend_menu.js"
import { DEBUGPRINTS } from "../config.js"

import { cancelRequest, declineRequest, acceptRequest } from "./requests.js"


let url;
let accessToken;
let friends;
let data;

// document.addEventListener("DOMContentLoaded", async () =>  {

//     // window.addEventListener("load",  async function () {
//         accessToken = getUserToken().access
//         console.log("hi windows addEventListener")

//         if (!accessToken ) {
//             console.log("Access token not found")
//             showLoginModal()
//             return;
//         }
//         url = `http://${window.location.host}/api/users/me/`
//         data = await get_data(url);
//         if (data)
//             document.getElementById("username-text-home-page").innerHTML = data.username
//         console.log("data", data)

//         // populateFriends("friend-list", data)
//         populateOutRequest("outgoing-requests", data)
//         populateInRequest("incoming-requests", data)
// });

export async function get_data(url_parameter)
{
    const response = await fetch(url_parameter, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
    });
    const response_data = await response.json()
    if (response.status != 200)
        return null;

    return response_data;
}

// function populateFriends(list_name, data) {
//     const friendList = document.getElementById(list_name);
//     // friendList.innerHTML = ""; // Clear existing content
    
//     if (data == null)
//         return
//     const friends = data.friends

//     friends.forEach(frienda => {

//         const friendDiv = document.createElement("div");
//         friendDiv.classList.add("friend");
//         friendDiv.innerHTML = `
//             <div class="friend">
//                 <div id="friend-name">${frienda}</div>
//                 <div class="friend-buttons">
//                     <button id="chat-friend">Chat</button>
//                     <button id="select-friend">Select</button>
//                 </div>
//             </div>
//         `;
//         friendList.appendChild(friendDiv);
//         friendDiv.querySelector("#select-friend").addEventListener("click", () => openSelectFriend(frienda));
//         friendDiv.querySelector("#chat-friend").addEventListener("click", () => openChattingBox(frienda));
//     });
// }

export function populateOutRequest(list_name, data) {
    const playerList = document.getElementById(list_name);
    playerList.innerHTML = ""; // Clear existing content
    if (DEBUGPRINTS) console.log("data populateOutRequest", data)

    if (data == null)
        return

    data.sent_requests.forEach(player => {

        const li = document.createElement('li');
        li.classList.add('friend-item');

        const img = document.createElement('img');
        img.src = player.img ? player.img : "./media/default.jpeg";
        img.alt = player.from_user;

        const nameTag = document.createElement('span');
        nameTag.textContent = `${player.to_user}`;
        nameTag.classList.add('player-name-tag');

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('friend-buttons');

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => cancelRequest(player.id));

        buttonContainer.appendChild(cancelBtn);
        li.appendChild(img);
        li.appendChild(nameTag);
        li.appendChild(buttonContainer);
        playerList.appendChild(li);
    });
}

export function populateInRequest(list_name, data) {
    const playerList = document.getElementById(list_name);
    if (DEBUGPRINTS) console.log("data populateInRequest", data)

    playerList.innerHTML = ""; // Clear existing content
    if (data == null)
        return

    data.received_requests.forEach(player => {
    
        const li = document.createElement('li');
        li.classList.add('friend-item');

        const img = document.createElement('img');
        img.src = player.img ? player.img : "./media/default.jpeg";
        img.alt = player.from_user;

        const nameTag = document.createElement('span');
        nameTag.textContent = `${player.from_user}`;
        nameTag.classList.add('friend-name-tag');

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('friend-buttons');

        const acceptBtn = document.createElement('button');
        acceptBtn.textContent = 'Accept';
        acceptBtn.addEventListener('click', () => acceptRequest(player.id));

        const declineBtn = document.createElement('button');
        declineBtn.textContent = 'Decline';
        declineBtn.addEventListener('click', () => declineRequest(player.id));
    
        buttonContainer.appendChild(acceptBtn);
        buttonContainer.appendChild(declineBtn);

        li.appendChild(img);
        li.appendChild(nameTag);
        li.appendChild(buttonContainer);
        playerList.appendChild(li);
    
        // friendList.appendChild(friendDiv);
        // friendList.getElementById("accept-request").addEventListener("click", () => acceptRequest(friend.id));
        // friendList.getElementById("decline-request").addEventListener("click", () => declineRequest(friend.id));
    });
}
