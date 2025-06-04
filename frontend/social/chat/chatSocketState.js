let chatSocket = null;

export function getChatSocket() {
  return chatSocket;
}

export function setChatSocket(socket) {
  chatSocket = socket;
}

export function closeChatSocket() {
  if (chatSocket) {
    chatSocket.close();
    chatSocket = null;
  }
}