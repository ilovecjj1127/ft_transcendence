//
//	loading/reloading so far I know happens on; 
//  refreshing page, first loading webpage,
//  changing route
//

import { get_data } from "@social/init_friends_data.js"
import { getUserFriendlist } from "@utils/userData.js"
import { DEBUGPRINTS } from "@/config.js"
import { getUserInfo } from "@utils/userData.js"
import { populateInRequest } from "@social/init_friends_data.js"
import { populateOutRequest } from "@social/init_friends_data.js"
import { OpenRoom } from "@chat/live_chatbox/open_chatbox.js"

const list = document.getElementById("friends-list")

export function populateFriendList() {

		let friendList = getUserFriendlist()
		if (DEBUGPRINTS) console.log("friendlist = ", friendList)
		if (friendList == null) {
				if (DEBUGPRINTS) console.log("friendlist = ", friendList)
				return;
		} else if (friendList.length == 0) {
				if (DEBUGPRINTS) console.log("friendlist len = ", friendList.length)
				return; }

		try {
				friendList = friendList.split(',');
				if (DEBUGPRINTS) console.log("friendList len; ", friendList.length)
		} catch (e) {
				console.error("Failed to parse friend list", e);
				friendList = [];
		}
		if (DEBUGPRINTS) console.log("typeof = ", typeof friendList)

		if (friendList.length > 0)
		{
			friendList.forEach(friend => {
				if (DEBUGPRINTS) console.log("friend; ", friend, "typeof; ", typeof friend);
				addFriendInList(friend)
			});
		}
}

export async function updateSocialRequestsData ()
{
    const url = `http://${window.location.host}/api/users/me/`
    let data = null
    data = await get_data(url);
    if (data)
		updateUserNameTagHTML(data.username)
        populateInRequest("incoming-requests", data, false)
        populateOutRequest("outgoing-requests", data, false)
}

function updateUserNameTagHTML(username)
{
    document.getElementById("username-text-home-page").innerHTML = username
}

export async function addFriendInList(friend)
{
	if (DEBUGPRINTS) console.log("friend; ", friend, "friend.name; ", friend.name);
	if (friend)
	{
		friend = friend.replace(/[\[\]"]/g, '');
		if (friend.name)
			friend.name = friend.replace(/[\[\]"]/g, '');
	}
	if (DEBUGPRINTS) console.log("friend; ", friend, "friend.name; ", friend.name);

	const existing = document.querySelector(`li[data-friend="${friend || friend.name}"]`);
	
	if (existing) {
		if (DEBUGPRINTS) console.log("Friend already in list:", friend);
		return; // Already in the list
	}

	const li = document.createElement('li')
	li.setAttribute('data-friend', friend.name || friend);


    let status = document.querySelector('.chatbox-message-status')
    status.innerText = li.dataset.status == "1" ? "online" : "offline"

	const img = document.createElement('img')

	const data = await getUserInfo(friend)
	if (DEBUGPRINTS) console.log("adding avatar", data)

	img.src = data.avatar || "./media/default.jpeg";
	img.style.borderColor = "grey";

	const notifyDot = document.createElement('div')
	notifyDot.classList.add('notify-dot')

	if (DEBUGPRINTS) console.log("adding friend", friend)
	
	const nameTag = document.createElement('span');
	nameTag.textContent = friend.name || friend;
	nameTag.style.marginTop = '5px';
	nameTag.style.fontSize = '0.9em';

	img.addEventListener('click', async () =>  {
		OpenRoom(friend)
	})
	li.appendChild(img)
	li.appendChild(nameTag);
	li.appendChild(notifyDot)
	list.appendChild(li)
}

export function removeFriendInList(friend) {
	
	// const li = document.getElementById("friend-list");
	// const li = document.querySelector(`li[data-friend="${friend.name || friend}"]`);
	
	const username = friend.name || friend;
	const item = document.querySelector(`li[data-friend="${username}"]`);
	
	if (DEBUGPRINTS) console.log("removeFriendInList(), item found:", item, " with username: ", username);
	
	if (item && item.parentElement) {
		item.parentElement.removeChild(item);
		if (DEBUGPRINTS) console.log(`Removed friend from list: ${username}`);
	} else {
		if (DEBUGPRINTS) console.log(`Friend not found in list: ${username}`);
	}

	// if (li) {
	// 	li.remove();
	// 	if (DEBUGPRINTS) console.log("Removed friend from list:", friend);
	// } else if (DEBUGPRINTS) {
	// 	console.log("Friend not found in list:", friend);
	// }
}
