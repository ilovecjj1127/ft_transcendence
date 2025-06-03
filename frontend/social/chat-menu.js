// in progress?? future feature??

// Sample chat rooms (Replace with actual API data)
const chatRooms = [
    "General Chat", "Gaming Hub", "Tech Talk", "Music Lovers", 
    "Coding Help", "Movie Discussion", "Random Chat", "Sports Zone"
];

// Populate chat room list
function loadChatRooms() {
    const list = document.getElementById("chat-room-list");
    list.innerHTML = ""; // Clear existing items

    chatRooms.forEach(room => {
        const li = document.createElement("li");
        li.textContent = room;
        li.onclick = () => selectChatRoom(room);// not defined yet
        list.appendChild(li);
    });
}
