const list = document.getElementById("friends-list")
const chatBox = document.querySelector('.chatbox-message-wrapper')
import { DEBUGPRINTS } from "./config.js"
import { getUserFriendlist } from "./utils/userData.js"

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

function addFriendInList(friend)
{
        const li = document.createElement('li')
        const img = document.createElement('img')
        img.src = friend.img ? friend.img : "./media/default.jpeg";
        if (DEBUGPRINTS) console.log("adding friend", friend)

        img.addEventListener('click', () => {
                //here change id with whatever
                if (DEBUGPRINTS) console.log("click on img friend; ", friend)
                if (DEBUGPRINTS) console.log("chatBox; ", chatBox)
                // if (DEBUGPRINTS) console.log("Outer html chatBox; ", chatBox.outerHTML)
                // if (DEBUGPRINTS) console.log("Inner html chatBox; ", chatBox.innerHTML)

                chatBox.querySelector('.chatbox-message-name').innerHTML = friend
                if (friendChatOpen && friendChatOpen.name == friend.name){
                chatBox.classList.remove('show')
                friendChatOpen = null
                } else {                
                if (chatBox.classList.contains('show')) {
                        chatBox.classList.remove('show')
                        if (DEBUGPRINTS) console.log("show chatBox ")

                                setTimeout(() => updateChat(friend), 600)
                                friendChatOpen = friend
                } else {
                        updateChat(friend)
                        friendChatOpen = friend
                }
                }
        })
        li.appendChild(img)
        list.appendChild(li)
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
})

// populateFriendList()

// 3 dots dropdown toggle (add eventlisteners for invite and remove) 

const dropDownToggle = document.querySelector('.chatbox-message-dropdown-toggle')
const dropDownMenu = document.querySelector('.chatbox-message-dropdown-menu')

dropDownToggle.addEventListener('click', function () {
        dropDownMenu.classList.toggle('show')
})

document.addEventListener('click', function (e) {
        if (!e.target.matches('.chatbix-message-dropdown, .chatbox-message-dropdown *')) {
                dropDownMenu.classList.remove('show')
        }
})

//message input

const textarea = document.querySelector('.chatbox-message-input')
const chatboxForm = document.querySelector('.chatbox-message-form')

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


//chatbox message

const chatboxMessageWrapper = document.querySelector('.chatbox-message-content')
const chatBoxNoMessage = document.querySelector('.chatbox-message-no-message')

chatboxForm.addEventListener('submit', function (e) {
        e.preventDefault()

        if (isValid(textarea.value)) {
                writeMessage()
                //remove autoreply, used for debugging
                setTimeout(autoReply, 1000)
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

//auto reply function for debugging, change this function and use it for reply by friend

function autoReply () {
        const today = new Date()
        let message = `
                <div class="chatbox-message-item received">
                        <span class="chatbox-message-item-text">
                                YO YO You got an answer!
                        </span>
                        <span class="chatbox-message-item-time">${addZero(today.getHours())}:${addZero(today.getMinutes())}</span>
                </div>
        `

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
