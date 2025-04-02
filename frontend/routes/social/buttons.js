function openSocialMenu() {
	document.getElementById("chat-container").style.display = "flex"
}
function closeSocialMenu() {
	document.getElementById("chat-container").style.display = "none"
}
function openSendRequestsForm() {
	document.getElementById("send-request-form").style.display = "block"
}
function closeSendRequestsForm() {
	document.getElementById("send-request-form").style.display = "none"
}
function openShowRequestsForm() {
	document.getElementById("show-requests-box").style.display = "block"
}
function closeShowRequestsForm() {
	document.getElementById("show-requests-box").style.display = "none"
}

// function ShowHide(id, display)
// {
// 	document.getElementById(id).style.display = display
// }
// Function to toggle the visibility of an element

function showHide(elementId, typeOfDisplay) {
    const element = document.getElementById(elementId);
	console.log("loading; ", elementId, "with ", typeOfDisplay)
    if (element.style.display === "none") {
        element.style.display = typeOfDisplay; // "flex" or "block" depending on layout
    } else {
        element.style.display = "none";
    }
}
