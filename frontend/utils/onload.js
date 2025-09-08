import { createMenuProfile } from "./profile-toggle.js"
import { saveUserInfo, getUserToken, getLanguage } from "./userData.js"
import { moveFaces } from "./bg-animation.js"
import { populateRequestList } from "../social/chat-menu.js"
import { populateFriendList } from "../social/chat.js"
import { createNotificationSocket } from "../social/notification-socket.js"
import { applyTranslations } from '../multilang/multi-lang.js'

export async function onloadInit () {
    const accessToken = getUserToken().access
    applyTranslations(getLanguage())
    setLanguageSelect()
    if (accessToken) {
        onLogin()
    } else {
        createMenuProfile()
    }
    if (location.hash != '/')
        location.hash = '/'
    moveFaces()
}


export async function onLogin () {
    const getInfo = await saveUserInfo()
    if (getInfo) {
        await languageCheck()
        toggleFriendsContainer('flex')
        createMenuProfile()
        await populateFriendList()
        await populateRequestList("received-tab")
        await createNotificationSocket()
    }
}

async function languageCheck () {
    let select = document.getElementById("languageSelect")
    let appLang = localStorage.getItem('appLanguage')
    if (select.value != appLang){
        select.value = appLang
        select.dispatchEvent(new Event("change"))
    }
}

function toggleFriendsContainer(show) {
    const friendsContainer = document.getElementById('friends-container');
    friendsContainer.style.display = show ? 'flex' : 'none'
    document.body.classList.toggle('friends-visible', show)
}

async function setLanguageSelect() {
    document.getElementById('languageSelect').value = getLanguage()
}