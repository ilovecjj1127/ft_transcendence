
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

function addZero(num) {
    return num < 10 ? '0'+num : num
}
