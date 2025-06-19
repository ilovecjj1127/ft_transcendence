import { addInRequest } from "./init_friends_data.js";
import { addOutRequest } from "./init_friends_data.js";
import { removeInOrOutRequest } from "./init_friends_data.js";


import { addFriendInList } from "../social/chat/chat_onload_functions.js"
import { getUserToken } from "../utils/userData.js";
import { DEBUGPRINTS } from "../config.js";
import { removeFriendInList } from "../social/chat/chat_onload_functions.js"

// to update live/dynamically social things on the webpage such as friend requests
export function initGeneralSocialDataSocket()
{
	const token = getUserToken().access;
    const socket = new WebSocket(
            `ws://${window.location.host}/ws/chat/general_social_data_socket_on_backend/?token=${token}`
    );

	socket.onopen = function(e) {
		console.log("[WS OPEN] Connection established.");
		// Optional: Authenticate via message
		socket.send(JSON.stringify({
			type: "authenticate",
			token: getUserToken().access
		}));
	};

    set_GeneralSocialDataSocket_EventFunctions(socket)
}

function set_GeneralSocialDataSocket_EventFunctions(socket) {
    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (DEBUGPRINTS) console.log("[WS MESSAGE] Data received:", data);

        switch(data.type) {
            case "new_incoming_friend_request":		// other_user --> host_user
				addInRequest("incoming-requests", data.payload);
                break;

            case "new_outgoing_friend_request":		// host_user --> other_user
                addOutRequest("outgoing-requests", data.payload);
                break;

            case "new_friend": // host_user matches new friend pair, in backend?
				addFriendInList(data.payload.friend_username)
				removeInOrOutRequest("incoming-requests", "outgoing-requests", data.payload.friend_username)
                break;

			case "breakoff_friendship": // host_user matches new friend pair, in backend?
				removeFriendInList(data.payload.friend_username)
				break;

			case "rejected_friend_request": // host_user matches new friend pair, in backend?
				removeInOrOutRequest("incoming-requests", "outgoing-requests", data.payload)
				break;

            case "cancelled_friend_request": // host_user matches new friend pair, in backend?
				removeInOrOutRequest("incoming-requests", "outgoing-requests", data.payload)
                break;


            // case "friend_online":
            //     setFriendOnlineStatus(data.payload.user_id, true);
            //     break;

            // case "friend_offline":
            //     setFriendOnlineStatus(data.payload.user_id, false);
            //     break;

            // case "new_notification":
            //     updateNotificationsUI(data.payload);
            //     break;

            default:
                console.warn("Unhandled WS message type:", data.type);
        }
    };

    socket.onerror = function(error) {
        console.error("[WS ERROR]", error);
    };

    socket.onclose = function(event) {
        console.log("[WS CLOSED]", event);
        // Optional: retry connection logic
    };
}
