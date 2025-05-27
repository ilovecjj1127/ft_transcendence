<div id="friendship-menu" style="flex-direction: row;">
<button class="social-menu-button" id="send-requests" onclick="showHide('send-request-form','flex')">
    <i class='bx bxs-user-plus'></i>
    <i class='bx bx-search-alt-2'></i>
    Send requests
</button>
<button class="social-menu-button" id="show-requests" onclick="showHide('show-requests-box','flex')">
    <i class='bx bxs-user-detail'></i>
    Show requests
</button>
<button class="social-menu-button" id="chat" onclick="showHide('chat-search-form','flex')">
    <i class='bx bxs-user-chat'></i>
    Chat(in progres)
</button>
</div>

const friendsMenu = document.createElement('div')
friendsMenu.id = "friendship-menu"
socialButton = document.createElement('button')
socialButton.id = "social-menu-button"
friendsMenu.appendChild(socialButton)


socialButton.addEventListener('click', () => )