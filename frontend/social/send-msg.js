

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

function scrollBottom () {
        chatboxMessageWrapper.scrollTo(0, chatboxMessageWrapper.scrollHeight)
}

function isValid(value) {
        let text = value.replace(/\n/g, '')
        text = text.replace(/\s/g, '')

        return text.length > 0
}