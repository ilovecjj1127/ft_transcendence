import { showLoginModal } from "./modals.js"
import { createMenuProfile } from "./profile-toggle.js"
import { checkToken } from "./token.js"
import { saveUserInfo, getUserToken, getUserAvatar} from "./userData.js"
import { moveFaces } from "./bg-animation.js"

export function onloadInit () {
    const accessToken = getUserToken().access
    const refreshToken = getUserToken().refresh
    
    if (!accessToken) {
        console.log("Access token not found")
        //showLoginModal()
    }
    else {
        console.log("Access token found:" + accessToken)
        saveUserInfo()
    }
    if (!refreshToken) {
        console.log("Refresh token not found")
    }
    else {
        console.log("Refresh token found:" + refreshToken)
    }
    
    if (location.hash != '/')
        location.hash = '/'

    createMenuProfile()
    moveFaces()
}

