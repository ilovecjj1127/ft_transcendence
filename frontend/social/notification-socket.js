import { getUserToken } from "../utils/userData.js";
import { checkToken } from "../utils/token.js";


export async function createNotificationSocket () {
    const isTokenValid = await checkToken()
    if (!isTokenValid) return 

    let token = getUserToken().access
    const socket = new WebSocket(`ws://${window.location.host}/ws/notifications/?token=${token}`)
    
    socket.onopen = () => {
        console.log("socket set up correctly")
        // const trackedUsers = ["alice", "bob", "cathy", "nnn"];
        // socket.send(JSON.stringify({
        //     type: "user_status_update",
        //     usernames: trackedUsers
        // }));
    }

    // socket.onmessage = (event) => {
    //     const data = JSON.parse(event.data);
    //     switch (data.type) {
    //         case "user_status_update":
    //             handleUserStatusUpdate(data.update)
    //             break;
    //         case "unread_chats":
    //             handleUnreadChats(data.unread_chats)
    //             break;
    //         case "player_is_waiting":
    //             handleGameInvite(data.opponent, data.game_id)
    //             break;
    //         default:
    //             console.warn("Unknown message type:", data)
    //     }
    // };

    // socket.onerror = (err) => {

    // }

    socket.onclose = (event) => {
        console.log("socket close", event)
    }
}

// function handleUserStatusUpdate(updates) {

// }

// function handleUnreadChats(unreadChats) {

// }

// function handleGameInvite(opponent, gameId) {

// }

