import { createMenuProfile } from "./profile-toggle.js"
import { saveUserInfo, getUserToken } from "./userData.js"
import { moveFaces } from "./bg-animation.js"
import { populateRequestList } from "../social/chat-menu.js"
import { populateFriendList } from "../social/chat.js"

export async function onloadInit () {
    const accessToken = getUserToken().access
    
    if (accessToken) {
        const getInfo = await saveUserInfo()
        if (getInfo) {
            populateFriendList()
            populateRequestList("received-tab")
        }
    }
    if (location.hash != '/')
        location.hash = '/'

    createMenuProfile()
    moveFaces()
}

