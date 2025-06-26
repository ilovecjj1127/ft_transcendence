import { getUsername, getUserToken, getLanguage } from "../utils/userData.js"
import { checkToken } from "../utils/token.js"
import { translations } from "../multilang/dictionary.js"

let activeSocket = null

export async function createWebSocket (chatId, li) {
    let socket

    const isTokenValid = await checkToken()
    if (!isTokenValid) return

        if (activeSocket && (activeSocket.readyState === WebSocket.OPEN || activeSocket.readyState === WebSocket.CONNECTING)) {
        activeSocket.close(); // Close previous socket
    }
        let token = getUserToken().access
        socket = new WebSocket(`ws://${window.location.host}/ws/chat/${chatId}/?token=${token}`)
        activeSocket = socket
        
        
        
        socket.onmessage = function (event) {
            const data = JSON.parse(event.data)
            const username = data.message.split(':')[0].trim();
            const message = data.message.split(':')[1].trim();
            writeMessage(username, message)
        }
    
        function sendMessage (message) {

            if (socket !== activeSocket) return

            if (socket.readyState == WebSocket.OPEN) {
                socket.send(JSON.stringify ({
                    message: message
                }))
                return true
            }
            else {
                console.log("socket not open, message not sent")
                return false
            }
        }

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

        textarea.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && event.shiftKey) {
                event.preventDefault()
                if (isValid(textarea.value)) {
                    sendMessage(textarea.value)
                }
            }
        })

        //chatbox message

        const chatboxMessageWrapper = document.querySelector('.chatbox-message-content')
        const chatBoxNoMessage = document.querySelector('.chatbox-message-no-message')

        chatboxForm.addEventListener('submit', function (e) {
                e.preventDefault()

                if (isValid(textarea.value)) {
                    sendMessage(textarea.value)
                }
        })

        function addZero(num) {
                return num < 10 ? '0'+num : num
        }

        function writeMessage (user, message) {
                const today = new Date()
                let msg
                if (user == getUsername()) {
                    msg = `
                        <div class="chatbox-message-item sent">
                            <span class="chatbox-message-item-text">
                                ${message.trim().replace(/\n/g, '<br>\n')}
                            </span>
                            <span class="chatbox-message-item-time">${addZero(today.getHours())}:${addZero(today.getMinutes())}</span>
                        </div>
                    `
                    
                    //reset the input 
                    chatboxForm.style.alignItems = 'center'
                    textarea.rows = 1
                    textarea.focus()
                    textarea.value = ''
                    //  chatBoxNoMessage.style.display = 'none'

                } else {
                    msg = `
                        <div class="chatbox-message-item received">
                            <span class="chatbox-message-item-text">
                                ${message.trim().replace(/\n/g, '<br>\n')}
                            </span>
                            <span class="chatbox-message-item-time">${addZero(today.getHours())}:${addZero(today.getMinutes())}</span>
                        </div>
                    `
                }
                
                //insert the message into the chatbox    
                chatboxMessageWrapper.insertAdjacentHTML('beforeend', msg)
                scrollBottom()
        }

        function writeGameInvite (user) {
                const today = new Date()
                let msg
                if (user == getUsername()) {
                    msg = `
                        <div class="chatbox-message-item sent">
                            <span class="chatbox-message-item-text">
                                ${message.trim().replace(/\n/g, '<br>\n')}
                            </span>
                            <span class="chatbox-message-item-time">${addZero(today.getHours())}:${addZero(today.getMinutes())}</span>
                        </div>
                    `
                    
                    //reset the input 
                    chatboxForm.style.alignItems = 'center'
                    textarea.rows = 1
                    textarea.focus()
                    textarea.value = ''
                    //  chatBoxNoMessage.style.display = 'none'

                } else {
                    msg = `
                        <div class="chatbox-message-item received">
                            <span class="chatbox-message-item-text">
                                ${message.trim().replace(/\n/g, '<br>\n')}
                            </span>
                            <span class="chatbox-message-item-time">${addZero(today.getHours())}:${addZero(today.getMinutes())}</span>
                        </div>
                    `
                }
                
                //insert the message into the chatbox    
                chatboxMessageWrapper.insertAdjacentHTML('beforeend', msg)
                scrollBottom()
        }


        function scrollBottom () {
                chatboxMessageWrapper.scrollTo(0, chatboxMessageWrapper.scrollHeight)
        }

        function isValid(value) {
                let text = value.replace(/\n/g, '')
                text = text.replace(/\s/g, '')

                return text.length > 0
        }
}

export function closeActiveWebsocket () {
    if (activeSocket) {
        activeSocket.close()
        activeSocket = null
    }
}

export function sendInviteMessage (gameId) {
    activeSocket.send(JSON.stringify ({
        message: `${translations[getLanguage()]['inviteMsg']} ${gameId}`
    }))
}