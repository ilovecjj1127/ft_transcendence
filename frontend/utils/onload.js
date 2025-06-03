import { createMenuProfile } from "./profile-toggle.js"
import { saveUserInfo, getUserToken } from "./userData.js"
import { moveFaces } from "./bg-animation.js"
import { populateFriendList } from "../social/chat/chat_onload_functions.js"
import { populateInRequest, populateOutRequest, get_data } from "../social/init_friends_data.js"
import { hideOrShowSocialMenu } from "./showOrHideFunctions.js"
import { updateSocialRequestsData } from "../social/chat/chat_onload_functions.js"
import { DEBUGPRINTS } from "../config.js"

export async function onloadInit () {
    const accessToken = getUserToken().access

    if (DEBUGPRINTS) console.log("onLoadInit")
    if (accessToken) {
        saveUserInfo()

        hideOrShowSocialMenu(accessToken)

        updateSocialRequestsData()

        populateFriendList()
    }
    if (location.hash != '/')
    {
        hideOrShowSocialMenu(accessToken)
        location.hash = '/'
    }

    createMenuProfile()

    moveFaces()
}

// import chat_button from "../?"
// function populateChatSearch () {
//     chat_button.addEventListener('click', () => showSearchBarChat());
// }
// showSearchBarChat()
// {
