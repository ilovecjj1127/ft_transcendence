import { checkToken, deleteTokenReload } from "../utils/token.js"
import { getUserToken } from "../utils/userData.js"

const list = document.getElementById("friends-list")
const chatBox = document.querySelector('.chatbox-message-wrapper')

//used to check if same friend is pressed
let friendChatOpen = null
let friendOpenDataSet = null

export function getFriendDataSet() {
	return friendOpenDataSet
}

export function closeChatOpen() {
	friendChatOpen = null
	friendOpenDataSet = null
	chatBox.classList.remove('show')
}

export function populateFriendList() {

	const friends = JSON.parse(localStorage.getItem("friends"))
	list.innerHTML = ''
	if (friends.length > 0){
		friends.forEach(friend => {
			const li = document.createElement('li')
			console.log(friend)
			const img = document.createElement('img')
			getUser(friend, img, li)
			img.addEventListener('click', () => {
			//here change id with whatever
				if (friendChatOpen && friendChatOpen == friend) {
					chatBox.classList.remove('show')
					friendChatOpen = null
				} else {                
					if (chatBox.classList.contains('show')) {
						chatBox.classList.remove('show')
				
						friendChatOpen = friend
						friendOpenDataSet = li.dataset
						setTimeout(() => updateChat(friend, li.dataset.img), 1000)
					} else {
						friendChatOpen = friend
						friendOpenDataSet = li.dataset
						updateChat(friend, li.dataset.img)

					}
				}
			})
			li.appendChild(img)
			list.appendChild(li)
		});
	}
}

async function getUser(user, profileImg, li) {
	const isTokenValid = await checkToken()
	
	if (!isTokenValid) return
	
	const searchUser = await fetch(`http://${window.location.host}/api/users/?username=${user}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${getUserToken().access}`
		},
	});
	if (searchUser.status == 401) deleteTokenReload()
	if (searchUser.ok)
	{
		const userSearched = await searchUser.json()
		li.dataset.user = user
		li.dataset.id = userSearched.id
		li.dataset.img = userSearched.avatar
		profileImg.src = userSearched.avatar
	} else {
		profileImg.src = "./media/default.jpeg"
	}
}

function updateChat (friend, imgSrc) {

   	let chatName = document.querySelector('.chatbox-message-name')
	let chatImg = document.querySelector('.chatbox-message-image')
	chatName.innerText = friend
	imgSrc != null ? chatImg.src = imgSrc : chatImg = "/media/default.jpeg"
	//get and update chat content
	//open websocket
   	chatBox.classList.add('show')
}

const closeChat = document.querySelector('.chatbox-message-close')

closeChat.addEventListener('click', function (){
    chatBox.classList.remove('show')
})
