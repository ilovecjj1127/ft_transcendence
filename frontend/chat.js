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
import { createGameWithPlayer } from "./routes/pong/onlineplayer/onlineplayer_through_chat.js"
import { updateChat } from "./tmp_utils_rik/chat_utils.js"

// chatbox message

const chatboxMessageWrapper = document.querySelector('.chatbox-message-content')
const chatBoxNoMessage = document.querySelector('.chatbox-message-no-message')

//used to check if same friend is pressed
let friendChatOpen = null

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

const statusDiv = document.getElementById('status_chat_search');


