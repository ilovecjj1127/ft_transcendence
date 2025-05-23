
// const socialmenubuttons_class = document.querySelector("social-menu-button")
const show_requests_button = document.getElementById("show-requests")
const send_requests_button = document.getElementById("send-requests")
const chat_search_button = document.getElementById("chat")
// addEventListener

// socialmenubuttons_class.addEventListener('click', async (event) => {

//     socialmenubuttons_class(socialmenubuttons_class, )

// }
// )

export default function showHide(elementId, typeOfDisplay) {
    const element = document.getElementById(elementId);
	if (DEBUGPRINTS) console.log("loading; ", elementId, "with ", typeOfDisplay)
    if (element.style.display === "none") {
        element.style.display = typeOfDisplay; // "flex" or "block" depending on layout
    } else {
        element.style.display = "none";
    }
}

window.showHide = showHide;
