import { scrollBottom } from "@chat/chat_utils.js"
import { isValid } from "@chat/chat_utils.js"
const dropDownToggle = document.querySelector('.chatbox-message-dropdown-toggle')
const dropDownMenu = document.querySelector('.chatbox-message-dropdown-menu')
import { loadRoute } from "@/app.js"
const gotoProfileButton = document.querySelector('#go-to-profile-button')
const blockOrUnblockButton = document.querySelector('#block-chatroom-button')
const removeFriendElem = document.querySelector('#remove-as-friend-button')
const invitePlayerForGame = document.querySelector('#invite-player-for-game-button')
const chatboxForm = document.querySelector('.chatbox-message-form')
const textarea = document.querySelector('.chatbox-message-input')
const chatBox = document.querySelector('.chatbox-message-wrapper')
import { getChatSocket } from "@chat/chatSocketState.js"
import { removeFriend } from "@social/select_friend_menu.js"
import { createGameWithPlayer } from "../../routes/pong/onlineplayer/onlineplayer_through_chat.js"
import { DEBUGPRINTS } from "@/config.js"
import { getUserToken } from "@/utils/userData.js"

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


        const date = new Date()
        const message = `hi do you want to play game?, game-id = ${localStorage.getItem("gameId")}, winning score = ${JSON.parse(localStorage.getItem("gameInfo")).winScore}`;
        getChatSocket().send(JSON.stringify({
        'message' : message,
        'date': date
        }));
        localStorage.setItem("chatbox-playerId", "")
        scrollBottom()
})

removeFriendElem.addEventListener('click', function () {

        let playername = document.querySelector('.chatbox-message-name').textContent.trim();
        if (DEBUGPRINTS) console.log("removing player as friend;  ", playername)
        try {
                removeFriend(playername);
        } catch (err) {
                console.error("Error in removeFriend:", err);
                console.trace();
        }
        // chatBox.classList.remove('show')

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

                getChatSocket().send(JSON.stringify({
                    'message': message,
                    'date': date
                }));
                if (DEBUGPRINTS) console.log("data #chatboxForm; ", message, "\nnow; ", date)
                scrollBottom()
        }
        textarea.value = '';
})
