
import { scrollBottom } from "../chat_utils.js"


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

export function addZero(num) {
    return num < 10 ? '0'+num : num
}


// import { io } from "socket.io-client";
import { initSocket } from "../dynamic_showing_of_requests.js";
import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";
