import { checkToken } from "../utils/token.js"
import { getUserToken, saveUserInfo, getLanguage} from "../utils/userData.js"
import { populateFriendList } from "./chat.js"
import { showNotification } from "./notification-socket.js"
import { fillGameNotification } from "./notification-storage.js"
import { translations } from "../multilang/dictionary.js"

const requestPanel = document.getElementById("request-panel")
const requestButton = document.getElementById("request-friend-btn")

const newFriendPanel = document.getElementById("new-friend-panel")
const newFriendButton = document.getElementById("add-friend-btn")

//button friend request panel
requestButton.addEventListener('click', () => {
    populateRequestList("received-tab")
    if (!requestPanel.classList.contains('show')) {
        if (newFriendPanel.classList.contains('show')) newFriendPanel.classList.remove('show')
        requestPanel.classList.add('show')
        showNotification(false)
    } else {
        requestPanel.classList.remove('show')
    }
})


//button add friend panel
newFriendButton.addEventListener('click', () => {
    if (!newFriendPanel.classList.contains('show')) {
        if (requestPanel.classList.contains('show')) requestPanel.classList.remove('show')
        newFriendPanel.classList.add('show')
    } else {
        newFriendPanel.classList.remove('show')
    }
})

// request panel tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

//switch tab in request panel
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.style.display = 'none');

        button.classList.add('active');
        document.getElementById(targetTab).style.display = 'block';
        populateRequestList(targetTab)

    });
});

// populate the list of requests to update
//TRY TO USE THIS FUNCTION TO UPDATE REQUEST ON NOTIFICATION
export async function populateRequestList(tabId) {

    const requestData = await saveUserInfo()
    
    if (requestData) {
         if (tabId == "received-tab") {
            fillReceived()
            fillGameNotification()
        } else { //sent tab
            fillSent()
        }
    } else {
        const list = document.querySelector(`#${tabId} ul`)
        list.innerHTML = `<li>${translations[getLanguage()]['loadError']}</li>`
    }
}

//fill received request dinamically
export function fillReceived() {

    const requests = JSON.parse(localStorage.getItem("received"))
    const list = document.querySelector(`#received-tab ul`)
    list.innerHTML = ''
    if (requests.length > 0) {
        
        requests.forEach(request => {
            const li = document.createElement('li')
            li.innerText = request['from_user']
            li.dataset.id = request['id']
            const btnContainer = document.createElement('div')
            
            const acceptBtn = document.createElement('button')
            acceptBtn.innerText = translations[getLanguage()]['accept']
            acceptBtn.addEventListener('click', async () => {
                const checkRequest = await handleRequest(li.dataset.id, li, list, acceptBtn, "accept")
                if (checkRequest) {
                    const check = await saveUserInfo()
                    if (check) 
                    {
                        populateFriendList()
                        console.log("friend added in list")
                    }
                }
            })
            
            const declineBtn = document.createElement('button')
            declineBtn.innerText = translations[getLanguage()]['decline']
            declineBtn.addEventListener('click', async () => {
                await handleRequest(li.dataset.id, li, list, declineBtn, "reject")
            })
            
            btnContainer.appendChild(acceptBtn)
            btnContainer.appendChild(declineBtn)
            li.appendChild(btnContainer)
            list.appendChild(li)
        })
    }

}

//fill sent request dinamically
function fillSent() {

    const requests = JSON.parse(localStorage.getItem("sent"))
    if (requests.length > 0){

        const list = document.querySelector(`#sent-tab ul`)
        list.innerHTML = ''
        requests.forEach(request => {
            const li = document.createElement('li')
            li.innerText = request['to_user']
            li.dataset.id = request['id']
            const btnContainer = document.createElement('div')
            
            const cancelBtn = document.createElement('button')
            cancelBtn.innerText = translations[getLanguage()]['cancel']
            cancelBtn.addEventListener('click', () => {
                console.log("cancel pressed")
                handleRequest(li.dataset.id, li, list, cancelBtn, "cancel")
            })
            
            btnContainer.appendChild(cancelBtn)
            li.appendChild(btnContainer)
            list.appendChild(li)
        })
    }
}

// handle request cancel, accept, decline
async function handleRequest (id, li, list, btn, url) {
    const isTokenValid = await checkToken()
    if (!isTokenValid) return
    
    const response = await fetch(`http://${window.location.host}/api/users/friendship_request/${url}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
        body: JSON.stringify({
            request_id: id,
        }),
    });
    if (response.status == 401) deleteTokenReload()
    if (response.ok) {
        list.removeChild(li)
        return true
    } else {
        btn.innerText = translations[getLanguage()]['error']
        btn.style.backgroundColor = "red"
        btn.style.color = "white"
        btn.disabled = true
        setTimeout( () => {
            btn.innerText = translations[getLanguage()]['cancel']
            btn.style.backgroundColor = "white"
            btn.style.color = "black"
            btn.disabled = false
        }, 3000)
        return false
    }
}

//SENDING FRIEND REQUEST

const newFriendInput = document.getElementById("new-friend-username")
newFriendInput.addEventListener('keydown', handleSendFriend)

//name search
function handleSendFriend (e) {
    if (e.key == 'Enter' && newFriendInput.value) {
        e.preventDefault()
        sendRequest(newFriendInput.value)
        newFriendInput.value = ''
    }
}

//send friend request
async function sendRequest(user) {
    const isTokenValid = await checkToken()
    if (!isTokenValid) return
    
    const responseMsg = document.getElementById("new-friend-msg")
    const response = await fetch(`http://${window.location.host}/api/users/friendship_request/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
        body: JSON.stringify({
            username: user,
        }),
    });
    if (response.status == 401) deleteTokenReload()
    if (response.ok) {
        responseMsg.innerText = translations[getLanguage()]['sentRequest']
        responseMsg.style.color = "green"
        responseMsg.style.display = 'block'
        setTimeout( () => {
            responseMsg.style.display = 'none'
        }, 3000)
        populateRequestList('sent-tab')
    } else {
        responseMsg.innerText = translations[getLanguage()]['errorSent']
        responseMsg.style.color = "red"
        responseMsg.style.display = 'block'
        setTimeout( () => {
            responseMsg.style.display = 'none'
        }, 3000)
    }
}