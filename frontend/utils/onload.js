import { showLoginModal } from "./modals.js"
import { createMenuProfile } from "./profile-toggle.js"
import { checkToken } from "./token.js"
import { saveUserInfo, getUserToken, getUserAvatar} from "./userData.js"
import { moveFaces } from "./bg-animation.js"
import { populateFriendList } from "../chat.js"
import { populateInRequest, populateOutRequest, get_data } from "../social/init_friends_data.js"


export async function onloadInit () {
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

    const url = `http://${window.location.host}/api/users/me/`
    let data = null
    data = await get_data(url);
    if (data)
        document.getElementById("username-text-home-page").innerHTML = data.username
        populateInRequest("incoming-requests", data)
        populateOutRequest("outgoing-requests", data)

    populateFriendList()

    createMenuProfile()

    moveFaces()
}
