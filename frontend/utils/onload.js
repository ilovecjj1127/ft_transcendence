import { createMenuProfile } from "./profile-toggle.js"
import { saveUserInfo, getUserToken } from "./userData.js"
import { moveFaces } from "./bg-animation.js"
import { populateFriendList } from "@/social/chat/chat_onload_functions.js"
import { updateSocialRequestsData } from "@/social/chat/chat_onload_functions.js"
import { DEBUGPRINTS } from "@/config.js"

import { populateInRequest, populateOutRequest, get_data } from "../social/init_friends_data.js"
import { hideOrShowSocialMenu } from "./showOrHideFunctions.js"
import { initGeneralSocialDataSocket } from "../social/for_dynamic_generalSocialDataSocket.js"

export async function onloadInit () {
    const accessToken = getUserToken().access

    if (DEBUGPRINTS) console.log("onLoadInit")
    if (accessToken) {
        saveUserInfo()

        initGeneralSocialDataSocket()

        // await initNotificationSocket()

        hideOrShowSocialMenu(accessToken)

        updateSocialRequestsData()

        populateFriendList()
    }
    if (location.hash != '/')
    {
        hideOrShowSocialMenu(accessToken)
        location.hash = '/'
    }
    // in else?
    createMenuProfile()

    moveFaces()
}

// import chat_button from "../?"
// function populateChatSearch () {
//     chat_button.addEventListener('click', () => showSearchBarChat());
// }
// showSearchBarChat()
// {
