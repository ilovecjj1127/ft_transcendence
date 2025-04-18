
function showHide(elementId, typeOfDisplay) {
    const element = document.getElementById(elementId);
	console.log("loading; ", elementId, "with ", typeOfDisplay)
    if (element.style.display === "none") {
        element.style.display = typeOfDisplay; // "flex" or "block" depending on layout
    } else {
        element.style.display = "none";
    }
}
