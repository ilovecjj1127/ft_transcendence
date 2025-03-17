import { showLoginModal } from "./modals.js"
import { createMenuProfile } from "./profile-toggle.js"
import { checkToken } from "./token.js"


export function onloadInit () {
    const accessToken = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")
    
    if (!accessToken) {
        console.log("Access token not found")
        showLoginModal()
    }
    else {
        checkToken()
        console.log("Access token found:" + accessToken)
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