import { showLoginModal } from "../utils/modals.js";
import { getUserToken } from "../utils/userData.js";
const closeChat = document.querySelector('.chatbox-message-close')
const chatBox = document.querySelector('.chatbox-message-wrapper')
import { DEBUGPRINTS } from "../config.js";
let switch_bool = true
import { setChatSocketEventFunctions } from "@chat/chatsocket_utils/chatsocket_utils.js";
import { handleLogout } from "../utils/logout.js";

// returns id of chatbox
export async function getOrcreateChattingBox(frienda)
{
    if (DEBUGPRINTS) console.log("hi create chat box with:", frienda)

    try {

        const response = await fetch(`http://${window.location.host}/api/chat/get_or_create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getUserToken().access}`
            },
            body: JSON.stringify({ "username": frienda })  // Fixed object syntax
        });


        // Check for 401 Unauthorized
        if (response.status === 401) {
            // Clear tokens
            // localStorage.removeItem("accessToken");
            // localStorage.removeItem("refreshToken");
            alert("Your session expired. Please log in again.");
            // handleLogout()
            return null;
        }

        // If not OK, handle other errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }


        const data = await response.json();  // ✅ Parse JSON

        if (DEBUGPRINTS) console.log("response id: ", data["chat_room_id"]);  // ✅ Access property
        return data["chat_room_id"];
    }
    catch(err) {
        // Network error or the above thrown Error
        console.error("Failed to get or create chat box:", err);
        // Optional: give user feedback in the UI
        alert("Sorry, we couldn’t open the chat. Please try again later.");
        throw err;  // re-throw so callers can also handle it if needed
        return null
    }
};
