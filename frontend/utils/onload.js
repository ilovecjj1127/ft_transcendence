import { createMenuProfile } from "./profile-toggle.js"
import { saveUserInfo, getUserToken } from "./userData.js"
import { moveFaces } from "./bg-animation.js"
import { populateFriendList } from "../chat.js"
import { populateInRequest, populateOutRequest, get_data } from "../social/init_friends_data.js"
import { hideOrShowSocialMenu } from "./showOrHideFunctions.js"
import { DEBUGPRINTS } from "../config.js"

// import { io } from "socket.io-client";
import { initSocket } from "../dynamic_showing_of_requests.js";
import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

function initGeneralSocialDataSocket()
{
    // const socket = io(`http://${window.location.host}`);
    //pseudocode;
    const socket = new WebSocket(
            `ws://${window.location.host}/ws/chat/general_social_data_socket_on_backend`
    );

    set_GeneralSocialDataSocket_EventFunctions(socket) 
    {

        socket.onmessage = function(event) {
        }
        socket.onthis

        socket.onthat
    }

    //pseudocode chatgpt;

    // Authenticate if needed
    socket.on('connect', () => {
        if (DEBUGPRINTS) console.log("calling: socket.on('connect', ()")
        socket.emit("authenticate", getUserToken().access);
    });

    // Listen for events
    socket.on('new_friend_request', (data) => {
        if (DEBUGPRINTS) console.log("calling: socket.on('new_friend_request', (data)")
        populateInRequest("incoming-requests", data);
    });

    socket.on('new_notification', (data) => {
        if (DEBUGPRINTS) console.log("calling: socket.on('new_notification', (data)")
        updateNotificationsUI(data);
    });
}

export async function onloadInit () {
    const accessToken = getUserToken().access

    if (DEBUGPRINTS) console.log("onLoadInit")
    if (accessToken) {
        saveUserInfo()

        initGeneralSocialDataSocket()

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
