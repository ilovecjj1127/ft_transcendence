import { createMenuProfile } from "./profile-toggle.js"
import { saveUserInfo, getUserToken } from "./userData.js"
import { moveFaces } from "./bg-animation.js"
import { fillReceived } from "../social/chat-menu.js"
import { populateFriendList } from "../social/chat.js"

export function onloadInit () {
    const accessToken = getUserToken().access
    
    if (accessToken) {
        if (saveUserInfo()) {
            populateFriendList()
            fillReceived()
        }
    }
    if (location.hash != '/')
        location.hash = '/'

    createMenuProfile()
    moveFaces()
}

