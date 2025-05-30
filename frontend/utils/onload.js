import { createMenuProfile } from "./profile-toggle.js"
import { saveUserInfo, getUserToken } from "./userData.js"
import { moveFaces } from "./bg-animation.js"
import { populateRequestList } from "../social/chat-menu.js"
import { populateFriendList } from "../social/chat.js"
import { createNotificationSocket } from "../social/notification-socket.js"

export async function onloadInit () {
    const accessToken = getUserToken().access
    
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
        populateFriendList()
        populateRequestList("received-tab")
        createNotificationSocket()
    }
}
