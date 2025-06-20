import { addInRequest } from "./init_friends_data.js";
import { addOutRequest } from "./init_friends_data.js";
import { removeInOrOutRequest } from "./init_friends_data.js";
import { populateInRequest } from "./init_friends_data.js";
import { populateOutRequest } from "./init_friends_data.js";
import { get_data } from "@social/init_friends_data.js"


import { addFriendInList } from "../social/chat/chat_onload_functions.js"
import { getUserToken } from "../utils/userData.js";
import { DEBUGPRINTS } from "../config.js";
import { removeFriendInList } from "../social/chat/chat_onload_functions.js"

// to update live/dynamically social things on the webpage such as friend requests
export async function initGeneralSocialDataSocket()
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

async function set_GeneralSocialDataSocket_EventFunctions(socket) {
    socket.onmessage = async function(event) {
        const data = JSON.parse(event.data);
        if (DEBUGPRINTS) console.log("[WS MESSAGE] Data received:", data);

        switch(data.type) {
            case "new_incoming_friend_request":		// other_user --> host_user
				// addInRequest("incoming-requests", data.payload);
                // addOutRequest("outgoing-requests", data.payload);
                const url1 = `http://${window.location.host}/api/users/me/`
                let data1 = null
                data1 = await get_data(url1);
                if (data1)
                    populateInRequest("incoming-requests", data1)
                break;

            case "new_outgoing_friend_request":		// host_user --> other_user

                // for single element;
                // addOutRequest("outgoing-requests", data.payload);

                const url2 = `http://${window.location.host}/api/users/me/`
                let data2 = null
                data2 = await get_data(url2);
                if (data2)
                    populateOutRequest("outgoing-requests", data2)
                break;

            case "new_friend": // host_user matches new friend pair, in backend?
                removeInOrOutRequest("incoming-requests", "outgoing-requests", data.payload.friend_username)
				addFriendInList(data.payload.friend_username)
                break;

			case "breakoff_friendship": // host_user matches new friend pair, in backend?
				// either friend or from_user_username
                removeFriendInList(data.payload.from_user_username ?? data.payload.friend)
				break;

			case "rejected_friend_request": // host_user matches new friend pair, in backend?
				removeInOrOutRequest("incoming-requests", "outgoing-requests", data.payload)
				break;

            case "cancelled_friend_request": // host_user matches new friend pair, in backend?
				removeInOrOutRequest("incoming-requests", "outgoing-requests", data.payload.from_user_username ?? data.payload.to_user_username)
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
        try {
            initGeneralSocialDataSocket()
            console.log("reopened socket after closing")

        } catch (error) {
            console.log("catch; failed to try reopening socket;", error)
        }
        // Optional: retry connection logic
    };
}
