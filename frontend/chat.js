const list = document.getElementById("friends-list")

const chatBox = document.querySelector('.chatbox-message-wrapper')
import { DEBUGPRINTS } from "./config.js"
import { getUserFriendlist } from "./utils/userData.js"
import openChattingBox from "./social/open_close_chat.js"
import { getUserToken } from "./utils/userData.js";
import { getOrcreateChattingBox } from "./social/open_close_chat.js"
import { removeFriend } from "./social/select_friend_menu.js"

const closeChat = document.querySelector('.chatbox-message-close')
// 3 dots dropdown toggle (add eventlisteners for invite and remove) 
const textarea = document.querySelector('.chatbox-message-input')
const chatboxForm = document.querySelector('.chatbox-message-form')
const invitePlayerForGame = document.querySelector('#invite-player-for-game-button')
const removeFriendElem = document.querySelector('#remove-as-friend-button')
const blockOrUnblockButton = document.querySelector('#block-chatroom-button')
const gotoProfileButton = document.querySelector('#go-to-profile-button')
import { loadRoute } from "./app.js"

const dropDownToggle = document.querySelector('.chatbox-message-dropdown-toggle')
const dropDownMenu = document.querySelector('.chatbox-message-dropdown-menu')
import { createGameReturnId } from "./routes/pong/onlineplayer/onlineplayer_through_chat.js"
import { get_data } from "./social/init_friends_data.js"
import  { createGameWithPlayer } from "./routes/pong/onlineplayer/onlineplayer_through_chat.js"
import { updateChat } from "./tmp_utils_rik/tmp_utils.js"
import { isValid } from "./tmp_utils_rik/tmp_utils.js"
import { scrollBottom } from "./tmp_utils_rik/tmp_utils.js"
import { checkToken } from "./utils/token.js"
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

let chat_box_id

export async function OpenRoom(friend)
{
        // openChattingBox(friend)
        // return
        //here change id with whatever
        if (DEBUGPRINTS) console.log("click on img friend; ", friend)
        if (DEBUGPRINTS) console.log("chatBox; ", chatBox)
        const token = getUserToken().access

        // if (!token) {
        //         showLoginModal()
        //         return
        // }
        if (chatSocket != null)
        {
                chatSocket.close()
                console.log("close called")
        }
        chat_box_id = await getOrcreateChattingBox(friend)

        if (chat_box_id == null)
        {
                statusDiv.textContent = `Status: chat_box_id is undefined`;
                chatBox.classList.remove('show')
                if (chatSocket != null) chatSocket.close()
                return
        }
        const data = await getUserInfo(friend)
        if (DEBUGPRINTS) console.log("adding avatar", data)

        const img = document.querySelector('.chatbox-message-image');
        img.src = data.avatar || "./media/default.jpeg";

        if (DEBUGPRINTS) console.log("chatboxid = ", chat_box_id)
        if (DEBUGPRINTS) console.log("window.location.host = ", window.location.host)
        
        if (DEBUGPRINTS) console.log("is valid?; ", checkToken(getUserToken()));

        chatSocket = new WebSocket(
                `ws://${window.location.host}/ws/chat/${chat_box_id}/?token=${token}`
        );

        localStorage.setItem("chatbox-playerId", data.id)


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
        if (DEBUGPRINTS) console.log("data #chat-message-submit; ", message)

        messageInput.value = '';
    };
    chatSocket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (DEBUGPRINTS) console.log("data onmessage; ", data)
        if (DEBUGPRINTS) console.log("date onmessage; ", data.date)
        if (DEBUGPRINTS) console.log("username onmessage; ", data.username)

        const split_data = data.message.split(":");
        const currentUser = document.querySelector('.chatbox-message-name').textContent.trim();

        let format
        if (data.username == currentUser)
                format = "sent"
        else
                format = "received"

        var match = data.message.match(/^hi do you want to play game\?, game-id = (\d+)$/);
        if (DEBUGPRINTS) console.log("Hi printing match; ", match);

        var gameId = null
        if (match)
                gameId = match[1];  // this is the number as a string

        format_and_put_Reply(data, format, gameId)

        if (DEBUGPRINTS) console.log("Hi printing match; ", match);

        if (gameId) {
                const button = chatboxMessageWrapper.querySelector('.join-button[data-gameid="' + gameId + '"]');
                if (button) {
                    button.addEventListener('click', () => {
                        const gameInfo = {}
                        gameInfo.gameId = gameId
                        // gameInfo.winScore = game.winning_score

                        // gameInfo.player1 = localStorage.getItem("user")
                        // gameInfo.player2 = currentUser

                        localStorage.setItem("gameInfo", JSON.stringify(gameInfo))
                        localStorage.setItem("gameId", gameId);

                        location.hash = '/pong/onlineplayer/onlinegame';
                        if (DEBUGPRINTS) console.log("location: ", location);
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
        if (DEBUGPRINTS) console.log(".onclose called")
    };
}

closeChat.addEventListener('click', function (){
    chatBox.classList.remove('show')
    chatSocket.close()
    if (DEBUGPRINTS) console.log("closing socket")
})

dropDownToggle.addEventListener('click', function () {
        dropDownMenu.classList.toggle('show')
})

document.addEventListener('click', function (e) {
        if (!e.target.matches('.chatbox-message-dropdown, .chatbox-message-dropdown *')) {
                dropDownMenu.classList.remove('show')
        }
})

gotoProfileButton.addEventListener('click', async (e) =>  {

        e.preventDefault()
        if (DEBUGPRINTS) console.log("hi goto profile")

        const chatboxname = document.querySelector('.chatbox-message-name').innerHTML
        if (DEBUGPRINTS) console.log("chatboxname; ", chatboxname)
        localStorage.setItem('userSearched', chatboxname);
        location.hash = '#/users'
        await loadRoute('users');
});

blockOrUnblockButton.addEventListener('click', async function () {
 
        const isBlocking = this.innerHTML.trim() === "Block";
        const elemChatbox = document.getElementById('chatting-box-id-v2')
        if (DEBUGPRINTS) console.log(elemChatbox); // should not be null
        const chatboxIdValue = elemChatbox.dataset.chatboxIdValue
        if (DEBUGPRINTS) console.log(chatboxIdValue); // should not be null
        const nameinchatbox = document.querySelector('.chatbox-message-name').textContent.trim();
        if (DEBUGPRINTS) console.log(nameinchatbox); // should not be null

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

invitePlayerForGame.addEventListener('click', async function () {

        const playerId = localStorage.getItem("chatbox-playerId")
        const friendname = document.querySelector(".chatbox-message-name")
        const game_id = await createGameWithPlayer(playerId)

        if (DEBUGPRINTS) console.log("inviting player; ", friendname.innerHTML, "playerId; ", playerId, "to game; ", localStorage.getItem("gameId"))
        const gameInfo = {}
        gameInfo.gameId = localStorage.getItem("gameId")
        localStorage.setItem("gameInfo", JSON.stringify(gameInfo))

        const date = new Date()
        const message = `hi do you want to play game?, game-id = ${localStorage.getItem("gameId")}`;
        chatSocket.send(JSON.stringify({
        'message' : message,
        'date': date
        }));
        localStorage.setItem("chatbox-playerId", "")
        scrollBottom()
})

removeFriendElem.addEventListener('click', function () {

let playername = document.querySelector('.chatbox-message-name').textContent.trim();
        if (DEBUGPRINTS) console.log("removing player as friend;  ", playername)
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
                const date = new Date()

                chatSocket.send(JSON.stringify({
                    'message': message,
                    'date': date
                }));
                if (DEBUGPRINTS) console.log("data #chatboxForm; ", message, "\nnow; ", date)
                scrollBottom()
        }
})

function reconnectChatSocket(chatBoxId, token) {
    if (chatSocket.readyState === WebSocket.CLOSING || chatSocket.readyState === WebSocket.CLOSED) {
        console.log('Reconnecting WebSocket...');
        chatSocket = new WebSocket(`ws://${window.location.host}/ws/chat/${chatBoxId}/?token=${token}`);
        setChatSocketEventFunctions();
    }
}

// import { addZero } from "./unused_functions_tmp/tmp_file_unused_functions.js"

export function addZero(num) {
    return num < 10 ? '0'+num : num
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
