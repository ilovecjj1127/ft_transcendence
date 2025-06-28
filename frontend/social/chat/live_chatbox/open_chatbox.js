
const chatBox = document.querySelector('.chatbox-message-wrapper')
import { DEBUGPRINTS } from "@/config.js"
import { getUserToken } from "@/utils/userData.js";
import { getOrcreateChattingBox } from "@social/get_or_create_chatbox.js"
import { checkToken } from "@utils/token.js"
import { getUserInfo } from "@utils/userData.js"
import { setChatSocketEventFunctions } from "@chat/chatsocket_utils/chatsocket_utils.js"
const closeChat = document.querySelector('.chatbox-message-close')


//chatbox message
import { updateChat } from "@chat/chat_utils.js"

// chatbox message
const chatboxMessageWrapper = document.querySelector('.chatbox-message-content')
const statusDiv = document.getElementById('status_chat_search');

let chat_box_id
//used to check if same friend is pressed
let friendChatOpen = null

import { getChatSocket } from '@chat/chatSocketState.js';
import { setChatSocket } from '@chat/chatSocketState.js';
import { closeChatSocket } from '@chat/chatSocketState.js';
import { debugWrap } from "../../../utils/debug/wrappers.js";

export const OpenRoom = debugWrap(true, OpenRoom_original_func, "OpenRoom", "orange", DEBUGPRINTS);

export async function OpenRoom_original_func(friend)
{
	//here change id with whatever
	if (DEBUGPRINTS) console.log("click on img friend; ", friend)
        if (DEBUGPRINTS) console.log("chatBox; ", chatBox)
        const token = getUserToken().access
		
        if (getChatSocket() != null)
        {
                getChatSocket().close()
                console.log("close called")
        }
        chat_box_id = await getOrcreateChattingBox(friend)

        if (chat_box_id == null)
        {
                statusDiv.textContent = `Status: chat_box_id is undefined`;
                chatBox.classList.remove('show')
                if (getChatSocket() != null) getChatSocket().close()
                return
        }

        const data = await getUserInfo(friend)
        if (DEBUGPRINTS) console.log("adding avatar", data)

        const img = document.querySelector('.chatbox-message-image');
        img.src = data.avatar || "./media/default.jpeg";

        if (DEBUGPRINTS) console.log("chatboxid = ", chat_box_id)
        if (DEBUGPRINTS) console.log("window.location.host = ", window.location.host)
        
        if (DEBUGPRINTS) console.log("is valid?; ", checkToken(getUserToken()));

        const socket = new WebSocket(
                `ws://${window.location.host}/ws/chat/${chat_box_id}/?token=${token}`
        );
        setChatSocket(socket)
        localStorage.setItem("chatbox-playerId", data.id)


        chatboxMessageWrapper.innerHTML = '';
        document.getElementById('chatting-box-id-v2').dataset.chatboxIdValue = chat_box_id;
        setChatSocketEventFunctions(getChatSocket())
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

closeChat.addEventListener('click', function (){
        // statusDiv.textContent = `Status: chat_box with ${friend} has been closed`;
        friendChatOpen = null
        chatBox.classList.remove('show')
        getChatSocket().close()
        
        if (DEBUGPRINTS) console.log("closeChat button clicked")
        if (DEBUGPRINTS) console.log("closing socket")
        localStorage.setItem("chatbox-playerId", "")
})
