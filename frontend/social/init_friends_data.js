import { showLoginModal } from "../utils/modals.js"
import { getUserToken } from "../utils/userData.js";
import { DEBUGPRINTS } from "../config.js"
import { cancelRequest, rejectRequest, acceptRequest } from "./requests.js"
import { getUserInfo } from "../utils/userData.js";

let url;
let accessToken;
let friends;
let data;

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

export async function addOutRequest(list_name, player_ws_obj)
{
    const playerList = document.getElementById(list_name);
    if (DEBUGPRINTS) console.log("data player: ", player_ws_obj)

    if (player_ws_obj == null)
        return

    const li = document.createElement('li');
    li.classList.add('friend-item');

    const img = document.createElement('img');

    const userInfo = await getUserInfo(player_ws_obj.to_user_username)
    if (DEBUGPRINTS) console.log("player_ws_obj: ", player_ws_obj)

    if (DEBUGPRINTS) console.log("data player: ", userInfo)
    img.src = userInfo.avatar || "./media/default.jpeg";
    
    // img.alt = player_ws_obj.from_user;

    const nameTag = document.createElement('span');
    nameTag.textContent = `${player_ws_obj.to_user_username}`;
    nameTag.classList.add('friend-name-tag');

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('friend-buttons');

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';





    
    cancelBtn.addEventListener('click', () => cancelRequest(player_ws_obj.to_user_id));

    buttonContainer.appendChild(cancelBtn);
    li.appendChild(img);
    li.appendChild(nameTag);
    li.appendChild(buttonContainer);
    playerList.appendChild(li);
}


export function populateOutRequest(list_name, data) {
    const playerList = document.getElementById(list_name);

    playerList.innerHTML = ""; // Clear existing content

    if (DEBUGPRINTS) console.log("data populateOutRequest", data)

    if (data == null)
        return

    data.sent_requests.forEach(async player => {
        const li = document.createElement('li');
        li.classList.add('friend-item');
    
        const img = document.createElement('img');
    
        const userInfo = await getUserInfo(player.to_user)
        if (DEBUGPRINTS) console.log("player: ", player.to_user)
    
        if (DEBUGPRINTS) console.log("data player: ", userInfo)
        img.src = userInfo.avatar || "./media/default.jpeg";
        // const avatar = getUserInfo(player).avatar || "./media/default.jpeg";
        
        // img.src = avatar || "./media/default.jpeg";
        img.alt = player.from_user;
    
        const nameTag = document.createElement('span');
        nameTag.textContent = `${player.to_user}`;
        nameTag.classList.add('friend-name-tag');
    
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('friend-buttons');
        console.log("player.id:", player.id, typeof player.id);

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => cancelRequest(player.id));
    
        buttonContainer.appendChild(cancelBtn);
        li.appendChild(img);
        li.appendChild(nameTag);
        li.appendChild(buttonContainer);
        playerList.appendChild(li);
    })
}


export async function addInRequest(list_name, player_ws_obj)
{
    const playerList = document.getElementById(list_name);

    if (player_ws_obj == null)
        return

    const li = document.createElement('li');
    li.classList.add('friend-item');

    const img = document.createElement('img');

    const userInfo = await getUserInfo(player_ws_obj.from_user_username)
    if (DEBUGPRINTS) console.log("player_ws_obj: ", player_ws_obj)

    if (DEBUGPRINTS) console.log("data player: ", userInfo)
    img.src = userInfo.avatar || "./media/default.jpeg";
    // img.alt = player_ws_obj.from_user;

    const nameTag = document.createElement('span');
    nameTag.textContent = `${player_ws_obj.from_user_username}`;
    nameTag.classList.add('friend-name-tag');

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('friend-buttons');

    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Accept';




    console.log("from_user_id:", player_ws_obj.from_user_id, typeof player_ws_obj.from_user_id);
    acceptBtn.addEventListener('click', () => acceptRequest(player_ws_obj.from_user_id));

    const rejectBtn = document.createElement('button');
    rejectBtn.textContent = 'Reject';
    rejectBtn.addEventListener('click', () => rejectRequest(player_ws_obj.from_user_id));

    buttonContainer.appendChild(acceptBtn);
    buttonContainer.appendChild(rejectBtn);

    li.appendChild(img);
    li.appendChild(nameTag);
    li.appendChild(buttonContainer);
    playerList.appendChild(li);
}

export function populateInRequest(list_name, data) {
    const playerList = document.getElementById(list_name);
    if (DEBUGPRINTS) console.log("data populateInRequest", data)

    playerList.innerHTML = ""; // Clear existing content
    if (data == null)
        return

    data.received_requests.forEach(async player => {

        const li = document.createElement('li');
        li.classList.add('friend-item');

        const img = document.createElement('img');

        const userInfo = await getUserInfo(player.from_user)
        if (DEBUGPRINTS) console.log("player: ", player.from_user)

        if (DEBUGPRINTS) console.log("data player: ", userInfo)
        img.src = userInfo.avatar || "./media/default.jpeg";
        img.alt = player.from_user;

        const nameTag = document.createElement('span');
        nameTag.textContent = `${player.from_user}`;
        nameTag.classList.add('friend-name-tag');

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('friend-buttons');

        const acceptBtn = document.createElement('button');
        acceptBtn.textContent = 'Accept';

        console.log("player.id:", player.id, typeof player.id);
        acceptBtn.addEventListener('click', () => acceptRequest(player.id));

        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'Reject';
        rejectBtn.addEventListener('click', () => rejectRequest(player.id));

        buttonContainer.appendChild(acceptBtn);
        buttonContainer.appendChild(rejectBtn);

        li.appendChild(img);
        li.appendChild(nameTag);
        li.appendChild(buttonContainer);
        playerList.appendChild(li);
    });
}

export function removeInOrOutRequest(list_name_A, list_name_B, username) {
	// const username = player_ws_obj?.to_user_username || player_ws_obj?.from_user_username;

    // const username = data.to_user_username ?? data.from_user_username ?? data.friend_username

    console.log("remove from list:", username);
	// if (!username) return;

	const removeFromList = (listId) => {
		const list = document.getElementById(listId);
        console.log("remove {username} from {list}:", username, list);

		if (!list) return;

		const items = list.querySelectorAll('li');
		for (const item of items) {
			const nameTag = item.querySelector('.friend-name-tag')
			console.log("item(of li list), nameTag, nameTage.textContent, username", item, nameTag, nameTag.textContent, username)
            if (nameTag && nameTag.textContent === username) {
				list.removeChild(item);
				if (DEBUGPRINTS) console.log(`Removed ${username} from ${listId}`);
				break;
			}
		}
	};

	removeFromList(list_name_A);

	if (list_name_B ){
		removeFromList(list_name_B)
	}
}
