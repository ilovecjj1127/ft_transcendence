function openSocialMenu() {
	document.getElementById("social-menu-container").style.display = "flex"
}
function closeSocialMenu() {
	document.getElementById("social-menu-container").style.display = "none"
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

function showHide(elementId, typeOfDisplay) {
    const element = document.getElementById(elementId);
	console.log("loading; ", elementId, "with ", typeOfDisplay)
    if (element.style.display === "none") {
        element.style.display = typeOfDisplay; // "flex" or "block" depending on layout
    } else {
        element.style.display = "none";
    }
}
