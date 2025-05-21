import { showLoginModal } from "../utils/modals.js";
import { getUserToken } from "../utils/userData.js";
const chatBox = document.querySelector('.chatbox-message-wrapper')
import { DEBUGPRINTS } from "../config.js";
let switch_bool = true
var chatSocket = null


// returns id of chatbox
export async function getOrcreateChattingBox(frienda)
{
    console.log("hi create chat box with:", frienda)

    try {

        const response = await fetch(`http://${window.location.host}/api/chat/get_or_create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getUserToken().access}`
            },
            body: JSON.stringify({ "username": frienda })  // Fixed object syntax
        });

        const data = await response.json();  // ✅ Parse JSON

        console.log("response id: ", data["chat_room_id"]);  // ✅ Access property
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


export default async function openChattingBox(frienda)
{
    const chat_box_id = await getOrcreateChattingBox(frienda)

    let chattingBox = document.getElementById("chatting-box-id-v2");
    chattingBox.setAttribute("value", chat_box_id)

    
    if (chattingBox.getAttribute("value") && switch_bool) {
        
        switch_bool = false
        const token = getUserToken().access
        
        if (!token) {
            showLoginModal()
            return
        }
        chatSocket = new WebSocket(
            `ws://${window.location.host}/ws/chat/${chat_box_id}/?token=${token}`
        );
        chatBox.querySelector('.chatbox-message-name').innerHTML = frienda
        
        // document.getElementById("chat-user-name").textContent = frienda;
        document.getElementById('chat-log').innerHTML = ""
        
        setChatSocketEventFunctions()
        
        chattingBox.style.display = "block";
    }
    else if (chattingBox.getAttribute("value") && !switch_bool)
        {
            if (chatSocket != null)
                {
                    chatSocket.close()
                    console.log("close called")
                }
                chattingBox.style.display = "none";
                switch_bool = true
            } else {
                console.error("Error: #chatting-box not found in the DOM.");
            }
}
