import { getLanguage } from "../utils/userData.js"
import { translations } from "../multilang/dictionary.js"
import { populateFriendList } from "./chat.js"

export function saveFriendNotification (id, user, status) {
    let notifications = JSON.parse(localStorage.getItem("friend-notifier")) || []

    const isDuplicate = notifications.some(notifier => notifier.id == id)
    const toAdd = !isDuplicate && status != "new"
    if (toAdd) {
        notifications.push({id, user, status})
        localStorage.setItem("friend-notifier", JSON.stringify(notifications))
    }
}

export function removeFriendNotification (id) { 
    let notifications = JSON.parse(localStorage.getItem("friends-notifier")) || []
    notifications = notifications.filter(notifier => notifier.id != id)

    const list = document.querySelector(`#received-tab ul`)

    const entries = list.querySelectorAll('li')
    entries.forEach(li => {
        if (li.dataset.id == id) list.removeChild(li)
    })

    localStorage.setItem("game-notifier", JSON.stringify(notifications))
}

export function fillFriendNotification () {
    let notifications = JSON.parse(localStorage.getItem("friend-notifier")) || []
    const list = document.querySelector(`#received-tab ul`)

    notifications.forEach(({id, user, status}) => {
        const li = document.createElement('li')

        switch (status) {
            case "accepted":
                handleAccepted(user, li, id)
                break;
            case "rejected":
                handleRejected(user, li, id)
                break;
            case "break_off":
                handleBreakOff(user, li)
                break;
            case "canceled":
                handleCanceled(user, li)
                break;
        }
        li.dataset.id = id
        const btnContainer = document.createElement('div')
        const removeBtn = document.createElement('button')
        removeBtn.innerText = "✖"

        removeBtn.addEventListener("click", () => {
            removeFriendNotification(gameId)
        })
        btnContainer.appendChild(removeBtn)
        li.appendChild(btnContainer)
        list.appendChild(li)
    });
}

function handleAccepted(user, li, id) {
    li.innerText = `${user} ${translations[getLanguage()]['acceptReq']}`
    const sentList = document.querySelector(`#sent-tab ul`)
    const entries = sentList.querySelectorAll('li')
    entries.forEach (entry => {
        if (entry.dataset.id == id) sentList.removeChild(entry)
    })
    populateFriendList()
}

function handleRejected(user, li, id) {
    li.innerText = `${user} ${translations[getLanguage()]['declineReq']}`
    const sentList = document.querySelector(`#sent-tab ul`)
    const entries = sentList.querySelectorAll('li')
    entries.forEach (entry => {
        if (entry.dataset.id == id) sentList.removeChild(entry)
    })
}

function handleBreakOff(user, li) {
    li.innerText = `${user} ${translations[getLanguage()]['breakOff']}`
    populateFriendList()   
}

function handleCanceled(user, li) {
    li.innerText = `${user} ${translations[getLanguage()]['cancelReq']}`
    const receivedList = document.querySelector(`#received-tab ul`)
    const entries = receivedList.querySelectorAll('li')
    entries.forEach (entry => {
        if (entry.dataset.id == id) receivedList.removeChild(entry)
    })
}