import { showLoginModal } from "../utils/modals.js";
import { getUserToken } from "../utils/userData.js";
const chatBox = document.querySelector('.chatbox-message-wrapper')
import { DEBUGPRINTS } from "../config.js";
let switch_bool = true
var chatSocket = null

export async function openChattingBox(frienda)
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
            `ws://127.0.0.1:8000/ws/chat/${chat_box_id}/?token=${token}`
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
        
        const chatboxMessageWrapper = document.querySelector('.chatbox-message-content')
        
        import format_and_put_Reply from "../chat.js"
        
        export function setChatSocketEventFunctions()
        {
            document.getElementById('chat-message-submit').onclick = async function() {
                const messageInput = document.getElementById('chat-message-input');
                const message = messageInput.value;
                
                chatSocket.send(JSON.stringify({
                    'message': message
                }));
                console.log("data #chat-message-submit; ", message)
                
                messageInput.value = '';
            };
            chatSocket.onmessage = function(event) {
                const data = JSON.parse(event.data);
                console.log("data onmessage; ", data.message)
                
                format_and_put_Reply(data.message)
                
                document.querySelector('#chat-log').innerHTML += `<p>${data.message}</p>`;
                
                console.log("data; ", data)

        // if (data.message == "")
        const match = data.message.match(/^hi do you want to play game\?, game-id = (\d+)$/);
        console.log("Hi printing match; ", match);

        if (match) {
            const gameId = match[1];  // this is the number as a string
            console.log("Matched! Game ID is:", gameId);
            
            // Create the join button
            const button = document.createElement("button");
            button.textContent = "Join";
            console.log("location: ", location);

            button.addEventListener('click', () => {
                // window.location.href = `/#/pong/onlineplayer/onlinegame`;
                
                localStorage.setItem("gameId", data.game.id)
                location.hash = '/pong/onlineplayer/onlinegame'
                console.log("location: ", location);
            });

            // http://127.0.0.1:8080/#/pong/onlineplayer/onlinegame
            console.log("print hmtl;", document.querySelector('.chatbox-message-item'));
            console.log("print hmtl;", document.querySelector('#chat-log'));

            document.querySelector('#chat-log').innerHTML.appendChild(button)
        } else {
            console.log("No match");
        }
    };
    chatSocket.onclose = function(event) {
        if (event.code === 1006) {
            alert(`Unauthorized: please log in first, reason; ${event.reason}`);
        } else if (event.code === 4000) {
            alert(`Chat room ${roomId} does not exist.`);
        } else if (event.code === 4001) {
            alert(`You are not allowed to enter chat room ${roomId}`);
        } else {
            console.error('Chat socket closed unexpectedly');
        }
        console.log(".onclose called")
    };
}

let friendChatOpen = null


export default async function OpenRoom2(friend)
{
    if (DEBUGPRINTS) console.log("chatBox; ", chatBox)
        // if (DEBUGPRINTS) console.log("Outer html chatBox; ", chatBox.outerHTML)
    // if (DEBUGPRINTS) console.log("Inner html chatBox; ", chatBox.innerHTML)
    const token = getUserToken().access

    let chattingBox = document.getElementById("chatting-box-id-v2");
    
    console.log("hi chattingBox = ", chattingBox)
    if (!token) {
        showLoginModal()
        return
    }
    if (chatSocket != null)
        {
            chatSocket.close()
            console.log("close called")
        }
        const chat_box_id = await getOrcreateChattingBox(friend)
        chattingBox.setAttribute("value", chat_box_id)
        chatSocket = new WebSocket(
                `ws://127.0.0.1:8000/ws/chat/${chat_box_id}/?token=${token}`
        );
        chatboxMessageWrapper.innerHTML = '';
        document.getElementById('chatting-box-id-v2').dataset.chatboxIdValue = chat_box_id;
        console.log("chatboxid = ", chat_box_id)
        setChatSocketEventFunctions()
        chatBox.querySelector('.chatbox-message-name').innerHTML = friend
        if (friendChatOpen && friendChatOpen.name == friend.name && friendChatOpen.name != undefined){
                if (DEBUGPRINTS) console.log("friendChatOpen && friendChatOpen.name == friend.name; ", friendChatOpen, friendChatOpen.name, friend.name)
                chatBox.classList.remove('show')
                friendChatOpen = null
        } else {                
        if (chatBox.classList.contains('show')) { // removes previous open one

                chatBox.classList.remove('show')
                if (DEBUGPRINTS) console.log("show chatBox ")
                setTimeout(() => updateChat(friend), 600)
                friendChatOpen = friend
        } else {
                updateChat(friend)
                friendChatOpen = friend
        }
        }
}

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
