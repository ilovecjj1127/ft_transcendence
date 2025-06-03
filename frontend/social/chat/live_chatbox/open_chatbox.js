
const chatBox = document.querySelector('.chatbox-message-wrapper')
import { DEBUGPRINTS } from "./config.js"
import { getUserToken } from "./utils/userData.js";
import { getOrcreateChattingBox } from "./social/open_close_chat.js"
import { updateChat } from "./tmp_utils_rik/tmp_utils.js"
import { checkToken } from "./utils/token.js"


//chatbox message
import { updateChat } from "./social/chat/chat_utils.js"

// chatbox message
const chatboxMessageWrapper = document.querySelector('.chatbox-message-content')
const statusDiv = document.getElementById('status_chat_search');

let chat_box_id
//used to check if same friend is pressed
let friendChatOpen = null

var chatSocket = null


export async function OpenRoom(friend)
{
        //here change id with whatever
        if (DEBUGPRINTS) console.log("click on img friend; ", friend)
        if (DEBUGPRINTS) console.log("chatBox; ", chatBox)
        const token = getUserToken().access

        if (chatSocket != null)
        {
                chatSocket.close()
                console.log("close called")
        }
        chat_box_id = await getOrcreateChattingBox(friend)

        if (chat_box_id == null)
        {
                statusDiv.textContent = `Status: chat_box_id is undefined`;
                chatBox.classList.remove('show')
                if (chatSocket != null) chatSocket.close()
                return
        }

        const data = await getUserInfo(friend)
        if (DEBUGPRINTS) console.log("adding avatar", data)

        const img = document.querySelector('.chatbox-message-image');
        img.src = data.avatar || "./media/default.jpeg";

        if (DEBUGPRINTS) console.log("chatboxid = ", chat_box_id)
        if (DEBUGPRINTS) console.log("window.location.host = ", window.location.host)
        
        if (DEBUGPRINTS) console.log("is valid?; ", checkToken(getUserToken()));

        chatSocket = new WebSocket(
                `ws://${window.location.host}/ws/chat/${chat_box_id}/?token=${token}`
        );

        localStorage.setItem("chatbox-playerId", data.id)


        chatboxMessageWrapper.innerHTML = '';
        document.getElementById('chatting-box-id-v2').dataset.chatboxIdValue = chat_box_id;
        setChatSocketEventFunctions()
        chatBox.querySelector('.chatbox-message-name').innerHTML = friend
        if (DEBUGPRINTS) console.log("friendChatOpen && friendChatOpen.name == friend.name; ", friendChatOpen, friend)
        if (friendChatOpen && friendChatOpen == friend && friendChatOpen != undefined){
                if (DEBUGPRINTS) console.log("friendChatOpen && friendChatOpen.name == friend.name; ", friendChatOpen, friendChatOpen, friend)

                chatBox.classList.remove('show')
                friendChatOpen = null
        } else {                
        if (chatBox.classList.contains('show')) { // removes previous open one

                chatBox.classList.remove('show')
                if (DEBUGPRINTS) console.log("show chatBox ")
                setTimeout(() => updateChat(friend), 600)
                friendChatOpen = friend
                statusDiv.textContent = `Status: chat_box is opened with ${friend}`;

        } else {
                statusDiv.textContent = `Status: chat_box is opened with ${friend}`;
                updateChat(friend)
                friendChatOpen = friend
        }
        }
}
