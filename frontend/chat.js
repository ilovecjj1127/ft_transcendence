const list = document.getElementById("friends-list")

const chatBox = document.querySelector('.chatbox-message-wrapper')
import { DEBUGPRINTS } from "./config.js"
import { getUserFriendlist } from "./utils/userData.js"
import openChattingBox from "./social/open_close_chat.js"
import { getUserToken } from "./utils/userData.js";
import { getOrcreateChattingBox } from "./social/open_close_chat.js"
import { removeFriend } from "./social/select_friend_menu.js"

//example to check the overflow-y
const friends = [
    {name: "friend1"},
    {name: "friend2"},
    {name: "friend3"},
    {name: "friend4"},
    {name: "friend5"},
    {name: "friend6"},
    {name: "friend7"},
    {name: "friend8"},
    {name: "friend9"},
    {name: "friend10"},
    {name: "friend11"},
    {name: "friend12"},
    {name: "friend13"},
    {name: "friend14"},
    {name: "friend15"},
    {name: "friend17"},
    {name: "friend18"},
    {name: "friend20"},
    {name: "friend21"},
    {name: "friend22"},
    {name: "friend23"},
    {name: "friend24"},
    {name: "friend25"},
    {name: "friend26"},
    {name: "friend27"},
    {name: "friend28"},
    {name: "friend29"},
    {name: "friend30"},
    {name: "friend31"},
    {name: "friend32"},
]

//chatbox message

const chatboxMessageWrapper = document.querySelector('.chatbox-message-content')
const chatBoxNoMessage = document.querySelector('.chatbox-message-no-message')

//used to check if same friend is pressed
let friendChatOpen = null

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
var chatSocket = null

export async function getUserInfo(username) {
        const response = await fetch(`http://${window.location.host}/api/users/?username=${username}`, {
                method: 'GET',
                headers: {
                  'accept': 'application/json',
                  'Authorization': `Bearer ${getUserToken().access}`
                },
        });
        const response_data = await response.json()

        console.log("avatar: ", response_data.avatar)
        return response_data;
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
const statusDiv = document.getElementById('status_chat_search');

export async function OpenRoom(friend)
{
        // openChattingBox(friend)
        // return
        //here change id with whatever
        if (DEBUGPRINTS) console.log("click on img friend; ", friend)
        if (DEBUGPRINTS) console.log("chatBox; ", chatBox)
        // if (DEBUGPRINTS) console.log("Outer html chatBox; ", chatBox.outerHTML)
        // if (DEBUGPRINTS) console.log("Inner html chatBox; ", chatBox.innerHTML)
        const token = getUserToken().access

        if (!token) {
                showLoginModal()
                return
        }
        if (chatSocket != null)
        {
                chatSocket.close()
                console.log("close called")
        }
        const chat_box_id = await getOrcreateChattingBox(friend)

        if (chat_box_id == null)
        {
                statusDiv.textContent = `Status: chat_box_id is undefined`;
                chatBox.classList.remove('show')
                chatSocket.close()
                return
        }
        const data = await getUserInfo(friend)
        if (DEBUGPRINTS) console.log("adding avatar", data)

        const img = document.querySelector('.chatbox-message-image');
        img.src = data.avatar || "./media/default.jpeg";

        console.log("chatboxid = ", chat_box_id)
        chatSocket = new WebSocket(
                `ws://127.0.0.1:8000/ws/chat/${chat_box_id}/?token=${token}`
        );
        chatboxMessageWrapper.innerHTML = '';
        document.getElementById('chatting-box-id-v2').dataset.chatboxIdValue = chat_box_id;
        setChatSocketEventFunctions()
        chatBox.querySelector('.chatbox-message-name').innerHTML = friend
        if (friendChatOpen && friendChatOpen.name == friend.name && friendChatOpen.name != undefined){
                if (DEBUGPRINTS) console.log("friendChatOpen && friendChatOpen.name == friend.name; ", friendChatOpen, friendChatOpen.name, friend.name)
                chatBox.classList.remove('show')
                friendChatOpen = null
        } else {                
        if (chatBox.classList.contains('show')) { // removes previous open one

                chatBox.classList.remove('show')
                if (DEBUGPRINTS) console.log("show chatBox ")
                setTimeout(() => updateChat(friend), 600)
                friendChatOpen = friend
                statusDiv.textContent = `Status: chat_box is opened with ${friend}`;

        } else {
                statusDiv.textContent = `Status: chat_box is opened with ${friend}`;
                updateChat(friend)
                friendChatOpen = friend
        }
        }
}




export function setChatSocketEventFunctions()
{
    document.getElementById('chat-message-submit').onclick = async function() {
        const messageInput = document.getElementById('chat-message-input');
        const message = messageInput.value;

        chatSocket.send(JSON.stringify({
            'message': message,
            'option-game-invite' : 0,
            'date': new Date()
        }));
        console.log("data #chat-message-submit; ", message)

        messageInput.value = '';
    };
    chatSocket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log("data onmessage; ", data)
        console.log("date onmessage; ", data.date)
        console.log("username onmessage; ", data.username)

        const split_data = data.message.split(":");
        const currentUser = document.querySelector('.chatbox-message-name').textContent.trim();
        
        let format
        if (data.username == currentUser)
                format = "sent"
        else
                format = "received"

        var match = data.message.match(/^hi do you want to play game\?, game-id = (\d+)$/);
        console.log("Hi printing match; ", match);

        var gameId = null
        if (match)
                gameId = match[1];  // this is the number as a string

        format_and_put_Reply(data, format, gameId)

        console.log("Hi printing match; ", match);

        if (gameId) {
                const button = chatboxMessageWrapper.querySelector('.join-button[data-gameid="' + gameId + '"]');
                if (button) {
                    button.addEventListener('click', () => {
                        localStorage.setItem("gameId", gameId);
                        location.hash = '/pong/onlineplayer/onlinegame';
                        console.log("location: ", location);
                    });
                    
                    document.querySelector('#chat-log').innerHTML += `<p>${data.message}</p>`;
                    
                }
            }
    };
    chatSocket.onclose = function(event) {
        if (event.code === 1006) {
            alert(`Unauthorized: please log in first, reason; ${event.reason}`);
        } else if (event.code === 4000) {
            alert(`Chat room ${roomId} does not exist.`);
        } else if (event.code === 4001) {
            alert(`You are not allowed to enter chat room ${roomId}`);
        } else {
            console.error('Chat socket closed unexpectedly');
        }
        console.log(".onclose called")
    };
}


function updateChat (friend) {
    /* 
    here update all content of chat box
    */
   chatBox.classList.add('show')
}

const closeChat = document.querySelector('.chatbox-message-close')

closeChat.addEventListener('click', function (){
    chatBox.classList.remove('show')
    chatSocket.close()
    console.log("closing socket")
})


// 3 dots dropdown toggle (add eventlisteners for invite and remove) 

const dropDownToggle = document.querySelector('.chatbox-message-dropdown-toggle')
const dropDownMenu = document.querySelector('.chatbox-message-dropdown-menu')

dropDownToggle.addEventListener('click', function () {
        dropDownMenu.classList.toggle('show')
})

document.addEventListener('click', function (e) {
        if (!e.target.matches('.chatbox-message-dropdown, .chatbox-message-dropdown *')) {
                dropDownMenu.classList.remove('show')
        }
})

//message input

const textarea = document.querySelector('.chatbox-message-input')
const chatboxForm = document.querySelector('.chatbox-message-form')
const invitePlayerForGame = document.querySelector('#invite-player-for-game-button')
const removeFriendElem = document.querySelector('#remove-as-friend-button')
const blockOrUnblockButton = document.querySelector('#block-chatroom-button')
const gotoProfileButton = document.querySelector('#go-to-profile-button')
// import { closeStats } from "./routes/users/users.js"

gotoProfileButton.addEventListener('click', (e) => {

        e.preventDefault()
        console.log("hi goto profile")
        location.hash = '/users'
        const closeBtn = document.getElementById('stats-close-button')
        console.log("closeBtn; ", closeBtn)

        if (closeBtn != null)
                closeBtn.click()
        // closeBtn.addEventListener('click', closeStats)

        const chatboxname = document.querySelector('.chatbox-message-name').innerHTML
        console.log("chatboxname; ", chatboxname)

        localStorage.setItem('userToSearchInStats', chatboxname);
});

blockOrUnblockButton.addEventListener('click', async function () {
        
        const isBlocking = this.innerHTML.trim() === "Block";
        const elemChatbox = document.getElementById('chatting-box-id-v2')
        console.log(elemChatbox); // should not be null
        const chatboxIdValue = elemChatbox.dataset.chatboxIdValue
        console.log(chatboxIdValue); // should not be null
        const nameinchatbox = document.querySelector('.chatbox-message-name').textContent.trim();
        console.log(nameinchatbox); // should not be null

        const response = await fetch(`http://${window.location.host}/api/chat/block_or_unblock/?chatroom_id=${chatboxIdValue}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getUserToken().access}`
                },
                body: JSON.stringify({"username": nameinchatbox})
        });
        const response_data = await response.json()
        if (DEBUGPRINTS) console.log("response_data: ok", response.ok, "data: ", response_data)

        if (response.ok) {
                this.innerHTML = isBlocking ? 'Unblock' : 'Block';
        } else {
                if (DEBUGPRINTS) console.error("Failed to toggle block state.");
        }
})

import { createGameReturnId } from "./routes/pong/onlineplayer/onlineplayer.js"
import { get_data } from "./social/init_friends_data.js"

invitePlayerForGame.addEventListener('click', async function () {

        const friendname = document.querySelector(".chatbox-message-name")
        const game_id = await createGameReturnId()

        console.log("inviting player; ", friendname, "to game; ", game_id)
        const date = new Date()
        const message = `hi do you want to play game?, game-id = ${game_id}`;
        chatSocket.send(JSON.stringify({
        'message' : message,
        // 'option-game-invite': game_id,
        'date': date
        }));
        scrollBottom()
})

removeFriendElem.addEventListener('click', function () {

let playername = document.querySelector('.chatbox-message-name').textContent.trim();
        console.log("removing player as friend;  ", playername)
removeFriend(playername)
chatBox.classList.remove('show')

})



textarea.addEventListener('input', function () {
        let line = textarea.value.split('\n').length

        if (textarea.rows < 6 || line < 6) {
                textarea.rows = line
        }

        if (textarea.rown > 1) {
                chatboxForm.style.alignItems = 'flex-end'
        } else {
                chatboxForm.style.alignItems = 'center'
        }
})

chatboxForm.addEventListener('submit', function (e) {
        e.preventDefault()

        if (isValid(textarea.value)) {
                const message = textarea.value.trim().replace(/\n/g, '<br>\n');
                // writeMessage()
                //remove autoreply, used for debugging
                // setTimeout(autoReply, 1000)

                const date = new Date()

                chatSocket.send(JSON.stringify({
                    'message': message,
                //     'option-game-invite': 0,
                    'date': date
                }));
                console.log("data #chatboxForm; ", message, "\nnow; ", date)
                scrollBottom()
        }
})

function addZero(num) {
        return num < 10 ? '0'+num : num
}

function writeMessage () {
        const today = new Date()
        let message = `
                <div class="chatbox-message-item sent">
                        <span class="chatbox-message-item-text">
                                ${textarea.value.trim().replace(/\n/g, '<br>\n')}
                        </span>
                        <span class="chatbox-message-item-time">${addZero(today.getHours())}:${addZero(today.getMinutes())}</span>
                </div>
        `

        //insert the message into the chatbox    
        chatboxMessageWrapper.insertAdjacentHTML('beforeend', message)
        //reset the input 
        chatboxForm.style.alignItems = 'center'
        textarea.rows = 1
        textarea.focus()
        textarea.value = ''
        chatBoxNoMessage.style.display = 'none'
        scrollBottom()
}

export default function format_and_put_Reply (data, format, gameId) {
        const today = new Date()
        const sent_date = new Date(data.date)


        let buttonHTML = '';
        if (gameId) {
            buttonHTML = `<button class="join-button" data-gameid="${gameId}">Join</button>`;
        }

        let message = `
                <div class="chatbox-message-item ${format}">
                        <span class="chatbox-message-item-text">
                                ${data.message}
                        </span>
                        ${buttonHTML}
                        <span class="chatbox-message-item-time">sent at: 
                        ${addZero(sent_date.getHours())}:${addZero(sent_date.getMinutes())} - ${sent_date.getUTCDate()} - ${addZero(sent_date.getUTCMonth())}</span>
                        </div>
                        `
                        // \tarrived:${addZero(today.getHours())}:${addZero(today.getMinutes())} - ${sent_date.getUTCDate()} - ${addZero(sent_date.getUTCMonth())}</span>
        chatboxMessageWrapper.insertAdjacentHTML('beforeend', message)
        scrollBottom()
}


// scroll bottom on new message

function scrollBottom () {
        chatboxMessageWrapper.scrollTo(0, chatboxMessageWrapper.scrollHeight)
}

function isValid(value) {
        let text = value.replace(/\n/g, '')
        text = text.replace(/\s/g, '')

        return text.length > 0
}
