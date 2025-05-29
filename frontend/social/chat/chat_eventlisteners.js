

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
                // writeMessage()
                //remove autoreply, used for debugging
                // setTimeout(autoReply, 1000)

                const date = new Date()

                chatSocket.send(JSON.stringify({
                    'message': message,
                //     'option-game-invite': 0,
                    'date': date
                }));
                if (DEBUGPRINTS) console.log("data #chatboxForm; ", message, "\nnow; ", date)
                scrollBottom()
        }
})

