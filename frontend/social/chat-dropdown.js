import { router } from "../app.js"
import { closeChatOpen, getFriendDataSet } from "./chat.js"
import { checkToken, deleteTokenReload } from "../utils/token.js"
import { getUserToken, getLanguage, getUsername } from "../utils/userData.js"
import { sendInviteMessage, sendBlockUnlockMessage} from "./chat-socket.js"
import { translations } from "../multilang/dictionary.js"

const dropDownToggle = document.querySelector('.chatbox-message-dropdown-toggle')
const dropDownMenu = document.querySelector('.chatbox-message-dropdown-menu')
const profileBtn = document.getElementById("chat-profile")
const removeBtn = document.getElementById("chat-remove")
const inviteBtn = document.getElementById("chat-invite")
const blockBtn = document.getElementById("chat-block")

dropDownToggle.addEventListener('click', function () {
        dropDownMenu.classList.toggle('show')
})

document.addEventListener('click', function (e) {
        if (!e.target.matches('.chatbix-message-dropdown, .chatbox-message-dropdown *')) {
                dropDownMenu.classList.remove('show')
        }
})

profileBtn.addEventListener('click', (e) => {
	e.preventDefault()
	localStorage.setItem("userSearched", document.querySelector('.chatbox-message-name').innerText)
	if (location.hash == '#/users')
	{
		location.hash = '/users'
		router()
	}
	location.hash = '/users'
})

blockBtn.addEventListener('click', (e)=> {
	e.preventDefault()
	const chatId = getFriendDataSet().chatId
	blockPlayer(chatId)
})

async function blockPlayer (chatId) {
	const isTokenValid = await checkToken()
	if (!isTokenValid) return
	
	const response = await fetch(`http://${window.location.host}/api/chat/block_or_unblock/?chatroom_id=${chatId}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${getUserToken().access}`
		},
	});
	if (response.status == 401) deleteTokenReload()
	if (response.ok) {
		const data = await response.json()
		const li = document.querySelector(`#friends-list li[data-chat-id="${chatId}"]`);		
		if (li.dataset.block == 'null') {
			li.dataset.block = getUsername()
			blockBtn.innerText = translations[getLanguage()]['unblock']
			closeChatOpen()
		}else{
			li.dataset.block = 'null'
			blockBtn.innerText = translations[getLanguage()]['block']
		}
	} else {
        blockBtn.innerText = translations[getLanguage()]['error']
        blockBtn.style.backgroundColor = "red"
       	blockBtn.style.color = "white"
        blockBtn.disabled = true
        setTimeout( () => {
            blockBtn.innerText = translations[getLanguage()]['block']
           	blockBtn.style.backgroundColor = "white"
            blockBtn.style.color = "black"
            blockBtn.disabled = false
        }, 3000)
	}
}

removeBtn.addEventListener('click', (e) => {
    e.preventDefault();
	const friendName = document.querySelector('.chatbox-message-name').innerText;
    removeFriend(friendName)
});

async function removeFriend (friendName) {
	const isTokenValid = await checkToken()
	if (!isTokenValid) return
	
	const response = await fetch(`http://${window.location.host}/api/users/remove_friend/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${getUserToken().access}`
		},
		body: JSON.stringify({
			username: friendName,
		}),
	});
	if (response.status == 401) deleteTokenReload()
	if (response.ok) {
		
		const list = document.getElementById('friends-list')
		const friendLi = Array.from(list.children).find(li => li.dataset.user === friendName);
		if (friendLi) {
			friendLi.remove();
			let friends = JSON.parse(localStorage.getItem("friends"));
			friends = friends.filter(friend => friend !== friendName);
			localStorage.setItem("friends", JSON.stringify(friends));
			closeChatOpen()
		}			
	} else {
        removeBtn.innerText = translations[getLanguage()]['error']
        removeBtn.style.backgroundColor = "red"
       	removeBtn.style.color = "white"
        removeBtn.disabled = true
        setTimeout( () => {
            removeBtn.innerText = translations[getLanguage()]['remove']
            removeBtn.style.backgroundColor = "white"
            removeBtn.style.color = "black"
            removeBtn.disabled = false
        }, 3000)
	}
}

inviteBtn.addEventListener('click', async (e) => {
	e.preventDefault()

	if (inviteForGame()) {

		if (location.hash == '#/pong/onlineplayer')
		{
			location.hash = '/pong/onlineplayer'
			router()
		}
	}
			
})

async function inviteForGame() {
	const score  = 10
	const playerId = getFriendDataSet().id
	if (score) {
		const isTokenValid = await checkToken()
		if (!isTokenValid) return
		
		const response = await fetch(`http://${window.location.host}/api/games/create/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getUserToken().access}`
			},
			body: JSON.stringify({
				player2: playerId,
				winning_score: score,
			}),
		});
		if (response.status == 401) deleteTokenReload()
		if (response.ok) {
			const data = await response.json()
			sendInviteMessage(data.game.id)
			return true
		} else {
			inviteBtn.innerText = translations[getLanguage()]['error']
			inviteBtn.style.backgroundColor = "red"
			inviteBtn.style.color = "white"
			inviteBtn.disabled = true
			setTimeout( () => {
				inviteBtn.innerText = translations[getLanguage()]['invite']
				inviteBtn.style.backgroundColor = "white"
				inviteBtn.style.color = "black"
				inviteBtn.disabled = false
			}, 3000)
		}
	}
}

