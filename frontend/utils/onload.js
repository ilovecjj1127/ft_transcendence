import { showLoginModal } from "./modals.js"
import { createMenuProfile } from "./profile-toggle.js"
import { checkToken } from "./token.js"
import { saveUserInfo, getUserToken} from "./userData.js"

export function onloadInit () {
    const accessToken = getUserToken().access
    const refreshToken = getUserToken().refresh
    
    if (!accessToken) {
        console.log("Access token not found")
        showLoginModal()
    }
    else {
        console.log("Access token found:" + accessToken)
        checkToken()
        saveUserInfo(accessToken)
        // if (getUserAvatar()) {
        //     const userAvatar = document.getElementById('profile-img')
        //     userAvatar.src = getUserAvatar()
        // }
        //retrieve all users info
    }
    //testing purpose to be removed, remove also alerts
    if (!refreshToken) {
        console.log("Refresh token not found")
    }
    else {
        console.log("Refresh token found:" + refreshToken)
    }
    
    createMenuProfile()
}

