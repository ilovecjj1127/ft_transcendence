
const chatBox = document.querySelector('.chatbox-message-wrapper')
const chatboxMessageWrapper = document.querySelector('.chatbox-message-content')

export function isValid(value) {
    let text = value.replace(/\n/g, '')
    text = text.replace(/\s/g, '')

    return text.length > 0
}

// scroll bottom on new message
export function scrollBottom () {
    chatboxMessageWrapper.scrollTo(0, chatboxMessageWrapper.scrollHeight)
}

export function updateChat (friend) {
    chatBox.classList.add('show')
}
