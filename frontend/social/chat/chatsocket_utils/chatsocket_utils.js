import { scrollBottom } from "../chat_utils.js"
import { DEBUGPRINTS } from "@/config.js";
import { addZero } from "@chat/chat_utils.js"
const chatboxMessageWrapper = document.querySelector('.chatbox-message-content')

import { getChatSocket } from '@chat/chatSocketState.js';
import { setChatSocket } from '@chat/chatSocketState.js';
import { closeChatSocket } from '@chat/chatSocketState.js';


export function setChatSocketEventFunctions(chatSocket)
{
	if (DEBUGPRINTS) console.log("chatSocket= ", chatSocket)
	if (chatSocket == null)
		return
    document.getElementById('chat-message-submit').onclick = async function() {
        const messageInput = document.getElementById('chat-message-input');
        const message = messageInput.value;

        getChatSocket().send(JSON.stringify({
            'message': message,
            'option-game-invite' : 0,
            'date': new Date()
        }));
        if (DEBUGPRINTS) console.log("data #chat-message-submit; ", message)

        messageInput.value = '';
    };
    getChatSocket().onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (DEBUGPRINTS) console.log("data onmessage; ", data)
        if (DEBUGPRINTS) console.log("date onmessage; ", data.date)
        if (DEBUGPRINTS) console.log("username onmessage; ", data.username)

        const split_data = data.message.split(":");
        const currentUser = document.querySelector('.chatbox-message-name').textContent.trim();

        let format
        if (data.username == currentUser)
                format = "sent"
        else
                format = "received"

        var match = data.message.match(/^hi do you want to play game\?, game-id = (\d+)$/);
        if (DEBUGPRINTS) console.log("Hi printing match; ", match);

        var gameId = null
        if (match)
                gameId = match[1];  // this is the number as a string

        format_and_put_Reply(data, format, gameId)

        if (DEBUGPRINTS) console.log("Hi printing match; ", match);

        if (gameId) {
                const button = chatboxMessageWrapper.querySelector('.join-button[data-gameid="' + gameId + '"]');
                if (button) {
                    button.addEventListener('click', () => {
                        const gameInfo = {}
                        gameInfo.gameId = gameId
                        // gameInfo.winScore = game.winning_score

                        // gameInfo.player1 = localStorage.getItem("user")
                        // gameInfo.player2 = currentUser

                        localStorage.setItem("gameInfo", JSON.stringify(gameInfo))
                        localStorage.setItem("gameId", gameId);

                        location.hash = '/pong/onlineplayer/onlinegame';
                        if (DEBUGPRINTS) console.log("location: ", location);
                    });
                    
                    document.querySelector('#chat-log').innerHTML += `<p>${data.message}</p>`;
                }
            }
    };
    getChatSocket().onclose = function(event) {
        if (event.code === 1006) {
            alert(`Unauthorized: please log in first, reason; ${event.reason}`);
        } else if (event.code === 4000) {
            alert(`Chat room ${roomId} does not exist.`);
        } else if (event.code === 4001) {
            alert(`You are not allowed to enter chat room ${roomId}`);
        } else {
            console.error('Chat socket closed unexpectedly');
        }
        if (DEBUGPRINTS) console.log(".onclose called")
    };
}

export default function format_and_put_Reply (data, format, gameId) {
        const today = new Date()
        const sent_date = new Date(data.date)

        let buttonHTML = '';
        if (gameId) {
            buttonHTML = `<button class="join-button" data-gameid="${gameId}">Join</button>`;
        }

        let message = `
                <div class="chatbox-message-item ${format}">
                        <span class="chatbox-message-item-text">
                                ${data.message}
                        </span>
                        ${buttonHTML}
                        <span class="chatbox-message-item-time">sent at: 
                        ${addZero(sent_date.getHours())}:${addZero(sent_date.getMinutes())} - ${sent_date.getUTCDate()} - ${addZero(sent_date.getUTCMonth())}</span>
                        </div>
                        `
                        // \tarrived:${addZero(today.getHours())}:${addZero(today.getMinutes())} - ${sent_date.getUTCDate()} - ${addZero(sent_date.getUTCMonth())}</span>
        chatboxMessageWrapper.insertAdjacentHTML('beforeend', message)
        scrollBottom()
}

function reconnectChatSocket(chatBoxId, token) {
    if (getChatSocket().readyState === WebSocket.CLOSING || chatSocket.readyState === WebSocket.CLOSED) {
        console.log('Reconnecting WebSocket...');
        const socket = new WebSocket(`ws://${window.location.host}/ws/chat/${chatBoxId}/?token=${token}`);
        setChatSocket(socket)
        setChatSocketEventFunctions();
    }
}
