import { createMenuProfile } from "./profile-toggle.js"
import { saveUserInfo, getUserToken } from "./userData.js"
import { moveFaces } from "./bg-animation.js"
import { populateFriendList } from "../chat.js"
import { populateInRequest, populateOutRequest, get_data } from "../social/init_friends_data.js"
import { hideOrShowSocialMenu } from "./showOrHideFunctions.js"
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

async function updateSocialRequestsData ()
{
    const url = `http://${window.location.host}/api/users/me/`
    let data = null
    data = await get_data(url);
    if (data)
        document.getElementById("username-text-home-page").innerHTML = data.username
        populateInRequest("incoming-requests", data)
        populateOutRequest("outgoing-requests", data)
}

// import chat_button from "../?"
// function populateChatSearch () {
//     chat_button.addEventListener('click', () => showSearchBarChat());
// }
// showSearchBarChat()
// {
