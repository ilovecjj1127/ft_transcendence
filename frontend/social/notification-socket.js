import { getUserToken, getFriends } from "@/utils/userData.js";
import { checkToken } from "../utils/token.js";
import { saveGameNotification } from "./notification-storage.js";
import { DEBUGSOCKET } from "@/config.js";
import { debugWrap } from "@/utils/debug/wrappers.js"

import { specialPrintFunction } from "@/utils/debug/debug_extra_utils.js"

let notificationId = null
// code copied from carlo/notifi
export async function createNotificationSocket () {
    const isTokenValid = await checkToken()
    // if (DEBUGSOCKET) console.log("createNotificationSocket () called ")

    if (!isTokenValid) return 

    let token = getUserToken().access
    const socket = new WebSocket(`ws://${window.location.host}/ws/notifications/?token=${token}`)
    
    socket.onopen = debugWrap(false, function(event) {
        // specialPrintFunction(DEBUGSOCKET, "createNotificationSocket; socket.onopen ", "yellow")

        const friends = JSON.parse(getFriends())
        socket.send(JSON.stringify({
            type: "user_status_update",
            usernames: friends
        }));
    }, "socket.onopen", "red", DEBUGSOCKET);

    socket.onmessage = debugWrap(false, function(event) {
        const data = JSON.parse(event.data);
        // specialPrintFunction(DEBUGSOCKET, "createNotificationSocket; socket.onmessage, data;  " + JSON.stringify(data) + " typeof data; " + typeof data, "yellow")
        console.log(data)
        // if (DEBUGSOCKET) console.log("%cNotification Socket onmessage, data; ", `color: yellow`, data, typeof data)
        switch (data.type) {
            case "user_status_update":
                handleUserStatusUpdate(data.update)
                break;
            case "unread_chats":
                handleUnreadChats(data.unread_chats)
                break;
            case "player_is_waiting":
                handleGameInvite(data.opponent, data.game_id)
                break;
            default:
                console.warn("Unknown message type:", data)
        }
    }, "socket.onmessage", "red", DEBUGSOCKET);

    socket.onerror = (err) => {
        if (DEBUGSOCKET) console.log(err)
    }

    socket.onclose = debugWrap(false, function(event) {
        // specialPrintFunction(DEBUGSOCKET, "createNotificationSocket; socket.onclose " + event, "yellow")
        // if (DEBUGSOCKET) console.log("socket close", event)
    }, "socket.onclose", "red", DEBUGSOCKET);
}

export const handleUserStatusUpdate = debugWrap(false, handleUserStatusUpdate_original_func, "handleUserStatusUpdate", "orange", DEBUGSOCKET);


function handleUserStatusUpdate_original_func(updates) {
    const friendsList = document.getElementById("friends-list").querySelectorAll("li")
    // if (DEBUGSOCKET) console.log("%chandleUserStatusUpdate () , updates; ", `color: yellow`, updates)

    friendsList.forEach((li) => {
        const user = li.dataset.friend
        const img = li.querySelector("img")
        // if (DEBUGSOCKET) console.log("friendlist; ", friendsList, "user; ", user)

        if (user in updates) {
    
            
            const isOnline = updates[user]
            li.dataset.status = isOnline


            let status = document.querySelector('.chatbox-message-status')
            status.innerText = li.dataset.status == "1" ? "online" : "offline"

            img.style.border = `6px solid ${isOnline ? "yellowgreen" : "grey"}`;
            // if (DEBUGSOCKET) console.log("img; ", img, "isOnline; ", isOnline, "img.style.borderColor; ", img.style.borderColor)

        }
    })
}

export const handleUnreadChats = debugWrap(false, handleUnreadChats_original_func, "handleUnreadChats", "orange", DEBUGSOCKET);

function handleUnreadChats_original_func(unreadChats) {
    const friendsList = document.getElementById("friends-list").querySelectorAll("li")
    // if (DEBUGSOCKET)console.log("%chandleUnreadChats () , friendlist; ", `color: yellow`, friendsList, "unread chats; ", `color: yellow`, unreadChats)

    friendsList.forEach((li) => {
        // if (DEBUGSOCKET) console.log("%chandleUnreadChats () , li; ", `color: yellow`, li, "li.user ", `color: yellow`, li.dataset.user)

        const user = li.dataset.user
        const dot = li.querySelector(".notify-dot")
        // if (DEBUGSOCKET) console.log("dot; ", dot)
        // if (DEBUGSOCKET) console.log("unreadChats; ", unreadChats)
        // if (DEBUGSOCKET) console.log("user; ", user)

        if (unreadChats.includes(user)) {
            // if (DEBUGSOCKET) console.log("dot.style.display; ", dot.style.display)
            dot.style.display = "block"
        }
    })
}

function handleGameInvite(opponent, gameId) {
    saveGameNotification(gameId, opponent)
    //add notification effects
    showGameInviteNotification(true)
}

export const showGameInviteNotification = debugWrap(false, showGameInviteNotification_original_func, "showGameInviteNotification", "orange", DEBUGSOCKET);

export function showGameInviteNotification_original_func (show) {
    const requestPanel = document.getElementById("show-requests")
    const button = document.getElementById("request-friend-btn")
    if (DEBUGSOCKET) console.log("%showGameInviteNotification () , elems to change; ", `color: yellow`, requestPanel, button)

    if (show) {
        requestPanel.backgroundColor = 'yellow'
        // if (!requestPanel.classList.contains('show')) {
        //     let isYellow = true;

        //     notificationId = setInterval(() => {
        //         button.style.backgroundColor = isYellow ? 'yellow' : 'var(--app-blue)'
        //         isYellow = !isYellow;
        //     }, 500);
        // }
    } else {
        clearInterval(notificationId)
        button.style.backgroundColor = 'var(--app-blue)'
    }
}