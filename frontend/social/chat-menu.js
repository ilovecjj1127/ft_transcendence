import { checkToken } from "../utils/token.js"
import { getUserToken, saveUserInfo } from "../utils/userData.js"

const requestPanel = document.getElementById("request-panel")
const requestButton = document.getElementById("request-friend-btn")

const newFriendPanel = document.getElementById("new-friend-panel")
const newFriendButton = document.getElementById("add-friend-btn")

//button friend request panel
requestButton.addEventListener('click', () => {
    if (!requestPanel.classList.contains('show')) {
        if (newFriendPanel.classList.contains('show')) newFriendPanel.classList.remove('show')
        requestPanel.classList.add('show')
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

//populateList("received-tab") //initialize first time

//switch tab in request panel
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.style.display = 'none');

        button.classList.add('active');
        document.getElementById(targetTab).style.display = 'block';

        targetTab == "received-tab" ? fillReceived() : fillSent()
    });
});

// populate the list of requests to update
//TRY TO USE THIS FUNCTION TO UPDATE REQUEST ON NOTIFICATION
async function populateList(tabId) {

    const requestData = await saveUserInfo()
    
    if (requestData) {
         if (tabId == "received-tab") {
            fillReceived()
        } else { //sent tab
            fillSent()
        }
    } else {
        const list = document.querySelector(`#${tabId} ul`)
        list.innerHTML = '<li>Error loading data</li>'
    }
}

//fill received request dinamically
export function fillReceived() {

    const requests = JSON.parse(localStorage.getItem("received"))
    if (requests.length > 0) {

        const list = document.querySelector(`#received-tab ul`)
        list.innerHTML = ''
        requests.forEach(request => {
            const li = document.createElement('li')
            li.innerText = request['from_user']
            li.dataset.id = request['id']
            const btnContainer = document.createElement('div')
            
            const acceptBtn = document.createElement('button')
            acceptBtn.innerText = "Accept"
            acceptBtn.addEventListener('click', () => {
                if (handleRequest(li.dataset.id, li, list, acceptBtn, "accept")) {
                    //addFriend or repopulate list
                    console.log("friend added")
                }
            })
            
            const declineBtn = document.createElement('button')
            declineBtn.innerText = "Decline"
            declineBtn.addEventListener('click', () => {
                handleRequest(li.dataset.id, li, list, declineBtn, "reject")
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
            cancelBtn.innerText = "Cancel"
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
    } else {
        btn.innerText = "Error"
        btn.style.backgroundColor = "red"
        btn.style.color = "white"
        btn.disabled = true
        setTimeout( () => {
            btn.innerText = "Cancel"
            btn.style.backgroundColor = "white"
            btn.style.color = "black"
            btn.disabled = false
        }, 3000)
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
        responseMsg.innerText = "Request sent correctly"
        responseMsg.style.color = "green"
        responseMsg.style.display = 'block'
        setTimeout( () => {
            responseMsg.style.display = 'none'
        }, 3000)
    } else {
        responseMsg.innerText = "Error sending request"
        responseMsg.style.color = "red"
        responseMsg.style.display = 'block'
        setTimeout( () => {
            responseMsg.style.display = 'none'
        }, 3000)
    }
}