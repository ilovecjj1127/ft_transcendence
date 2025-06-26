import { createMenuProfile } from "./profile-toggle.js"
import { saveUserInfo, getUserToken } from "./userData.js"
import { moveFaces } from "./bg-animation.js"
import { populateFriendList } from "@/social/chat/chat_onload_functions.js"
import { updateSocialRequestsData } from "@/social/chat/chat_onload_functions.js"
import { DEBUGPRINTS } from "@/config.js"

import { populateInRequest, populateOutRequest, get_data } from "../social/init_friends_data.js"
import { hideOrShowSocialMenu } from "./showOrHideFunctions.js"
import { initGeneralSocialDataSocket } from "../social/for_dynamic_generalSocialDataSocket.js"
import { createNotificationSocket } from "@/social/notification-socket.js"


export async function onloadInit () {
    const accessToken = getUserToken().access

    if (DEBUGPRINTS) console.log("onLoadInit")
    if (accessToken) {
        onLogin()
        createMenuProfile()
    }
    else
    {
        createMenuProfile(accessToken)
    }
    if (location.hash != '/')
    {
        hideOrShowSocialMenu(accessToken)
        location.hash = '/'
    }
    moveFaces()
}

export async function onLogin (accessToken) {
    const getInfo = await saveUserInfo()
    if (getInfo) {
        await populateFriendList()
        await hideOrShowSocialMenu(accessToken)
        await updateSocialRequestsData()

        await createNotificationSocket()
        await initGeneralSocialDataSocket()

        // toggleFriendsContainer('flex')
        // await populateRequestList("received-tab")
        // await createNotificationSocket()
    }
}

// import chat_button from "../?"
// function populateChatSearch () {
//     chat_button.addEventListener('click', () => showSearchBarChat());
// }
// showSearchBarChat()
// {
