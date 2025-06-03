//
//	loading/reloading so far I know happens on; 
//  refreshing page, first loading webpage,
//  changing route
//
import { get_data } from "./social/init_friends_data.js"
import { getUserFriendlist } from "./utils/userData.js"
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
		} catch (e) {
				console.error("Failed to parse friend list", e);
				friendList = [];
		}
		if (DEBUGPRINTS) console.log("typeof = ", typeof friendList)

		friendList.forEach(friend => {
				addFriendInList(friend)
		});
}

async function updateSocialRequestsData ()
{
    const url = `http://${window.location.host}/api/users/me/`
    let data = null
    data = await get_data(url);
    if (data)
        document.getElementById("username-text-home-page").innerHTML = data.username
        populateInRequest("incoming-requests", data)
        populateOutRequest("outgoing-requests", data)
}

async function addFriendInList(friend)
{
		const li = document.createElement('li')

		const img = document.createElement('img')

		const data = await getUserInfo(friend)
		if (DEBUGPRINTS) console.log("adding avatar", data)

		img.src = data.avatar || "./media/default.jpeg";

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

		list.appendChild(li)
}
