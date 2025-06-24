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
        createMenuProfile()
        await populateFriendList()
        await populateRequestList("received-tab")
        await createNotificationSocket()
    }
}


