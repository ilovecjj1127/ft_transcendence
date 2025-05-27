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