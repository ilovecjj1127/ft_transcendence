import { checkToken, deleteTokenReload } from "../utils/token.js"
import { getUserToken } from "../utils/userData.js"
import { createWebSocket, closeActiveWebsocket } from "./chat-socket.js"

const list = document.getElementById("friends-list")
const chatBox = document.querySelector('.chatbox-message-wrapper')

//used to check if same friend is pressed
let friendChatOpen = null
let friendOpenDataSet = null

export function getFriendDataSet() {
	return friendOpenDataSet
}

export function getFriendChatOpen () {
	return friendChatOpen
}

export function closeChatOpen() {
	friendChatOpen = null
	friendOpenDataSet = null
	closeActiveWebsocket()
	chatBox.classList.remove('show')
}

export async function populateFriendList() {

	const friends = JSON.parse(localStorage.getItem("friends"))
	list.innerHTML = ''
	if (friends.length > 0){
		for (const friend of friends) {
			const li = document.createElement('li')
			const img = document.createElement('img')
			const notifyDot = document.createElement('div')
			notifyDot.classList.add('notify-dot')
			getUser(friend, img, li)
			img.addEventListener('click', () => {
				if (friendChatOpen && friendChatOpen == friend) {
					closeChatOpen()
				} else {                
					if (chatBox.classList.contains('show')) {
						closeChatOpen()
				
						friendChatOpen = friend
						friendOpenDataSet = li.dataset
						setTimeout(() => updateChat(friend, li.dataset.img, li), 1000)
					} else {
						friendChatOpen = friend
						friendOpenDataSet = li.dataset
						updateChat(friend, li.dataset.img, li)
					}
				}
			})
			li.appendChild(img)
			li.appendChild(notifyDot)
			list.appendChild(li)
		}
	}
}

async function updateChat (friend, imgSrc, li) {
	const chatId = await getCreateChat(friend)
	li.dataset.chatId = chatId
	createWebSocket(chatId)
	li.querySelector(".notify-dot").style.display = "none"
	let chatboxContent = document.querySelector('.chatbox-message-content')
	chatboxContent.innerHTML = ''
	let chatName = document.querySelector('.chatbox-message-name')
	let chatImg = document.querySelector('.chatbox-message-image')
	let status = document.querySelector('.chatbox-message-status')
	status.innerText = li.dataset.status == "1" ? "online" : "offline"
	chatName.innerText = friend
	imgSrc != null ? chatImg.src = imgSrc : chatImg.src = "/media/default.jpeg"
	
	chatBox.classList.add('show')
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

async function getCreateChat(user) {
		const isTokenValid = await checkToken()
	
	if (!isTokenValid) return
	
	const openChat = await fetch(`http://${window.location.host}/api/chat/get_or_create/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${getUserToken().access}`
		},
		body: JSON.stringify({username: user}),
	});
	if (openChat.status == 401) deleteTokenReload()
	if (openChat.ok)
	{
		const data = await openChat.json()
		const chatId = data.chat_room_id
		return chatId
	} else {
		return null
	}
} 

const closeChat = document.querySelector('.chatbox-message-close')

closeChat.addEventListener('click', closeChatOpen)
