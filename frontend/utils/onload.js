import { createMenuProfile } from "./profile-toggle.js"
import { saveUserInfo, getUserToken } from "./userData.js"
import { moveFaces } from "./bg-animation.js"

export function onloadInit () {
    const accessToken = getUserToken().access
    
    if (accessToken) {
        saveUserInfo()
    }
    if (location.hash != '/')
        location.hash = '/'

    createMenuProfile()
    moveFaces()
}

