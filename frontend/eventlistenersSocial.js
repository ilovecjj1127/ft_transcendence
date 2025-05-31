
// import { showHide } from "./social/buttons.js"

document.addEventListener('DOMContentLoaded', function() {
    const sendRequestsButton = document.getElementById('send-requests');
    const showRequestsButton = document.getElementById('show-requests');
    const chatButton = document.getElementById('chat');

    if (sendRequestsButton) {
        sendRequestsButton.addEventListener('click', function() {
            showHide('send-request-form', 'flex');  // Show the 'send-request-form' element
        });
    }

    if (showRequestsButton) {
        showRequestsButton.addEventListener('click', function() {
            showHide('show-requests-box', 'flex');  // Show the 'show-requests-box' element
        });
    }

    if (chatButton) {
        chatButton.addEventListener('click', function() {
            showHide('chat-search-form', 'flex');  // Show the 'chat-search-form' element
        });
    }
});

function showHide(elementId, displayStyle) {
    const element = document.getElementById(elementId);
    if (element) {
        if (element.style.display === displayStyle) {
            element.style.display = 'none';  // Hide the element
        } else {
            element.style.display = displayStyle;  // Show the element
        }
    }
}
