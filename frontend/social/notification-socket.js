import { getUserToken, getFriends } from "@/utils/userData.js";
import { checkToken } from "../utils/token.js";
import { saveGameNotification } from "./notification-storage.js";

let notificationId = null
// code copied from carlo/notifi
export async function createNotificationSocket () {
    const isTokenValid = await checkToken()
    console.log("createNotificationSocket () called ")

    if (!isTokenValid) return 

    let token = getUserToken().access
    const socket = new WebSocket(`ws://${window.location.host}/ws/notifications/?token=${token}`)
    
    socket.onopen = () => {
        console.log("Notification Socket onopen ")

        const friends = JSON.parse(getFriends())
        socket.send(JSON.stringify({
            type: "user_status_update",
            usernames: friends
        }));
    }

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Notification Socket onmessage, data; ", event.data)
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
    };

    socket.onerror = (err) => {
        console.log(err)
    }

    socket.onclose = function (event) {
        console.log("socket close", event)
    }
}

function handleUserStatusUpdate(updates) {
    const friendsList = document.getElementById("friends-list").querySelectorAll("li")
    console.log("handleUserStatusUpdate () , updates; ", updates)

    friendsList.forEach((li) => {
        const user = li.dataset.friend
        const img = li.querySelector("img")
        console.log("friendlist; ", friendsList, "user; ", user)

        if (user in updates) {
    
            
            const isOnline = updates[user]
            li.dataset.status = isOnline


            let status = document.querySelector('.chatbox-message-status')
            status.innerText = li.dataset.status == "1" ? "online" : "offline"

            img.style.border = `6px solid ${isOnline ? "yellowgreen" : "grey"}`;
            console.log("img; ", img, "isOnline; ", isOnline, "img.style.borderColor; ", img.style.borderColor)

        }
    })
}

function handleUnreadChats(unreadChats) {
    const friendsList = document.getElementById("friends-list").querySelectorAll("li")

    friendsList.forEach((li) => {
        const user = li.dataset.user
        const dot = li.querySelector(".notify-dot")
        if (unreadChats.includes(user)) {
            dot.style.display = "block"
        }
    })
}

function handleGameInvite(opponent, gameId) {
    saveGameNotification(gameId, opponent)
    //add notification effects
    showNotification(true)
}

export function showNotification (show) {
    const requestPanel = document.getElementById("request-panel")
    const button = document.getElementById("request-friend-btn")
    if (show) {

        if (!requestPanel.classList.contains('show')) {
            let isYellow = false;
    
            notificationId = setInterval(() => {
                button.style.backgroundColor = isYellow ? 'yellow' : 'var(--app-blue)'
                isYellow = !isYellow;
            }, 500);
        }
    } else {
        clearInterval(notificationId)
        button.style.backgroundColor = 'var(--app-blue)'
    }        
}