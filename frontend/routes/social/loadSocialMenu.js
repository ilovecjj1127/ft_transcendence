async function loadSocialMenu() {
    // const response = await fetch("./social-menu.html");
    // const html = await response.text();
    // document.getElementById("social-menu-container").innerHTML = html;
	fetch('routes/social/social-menu.html')
	.then(response => response.text())
	.then(html => {
		document.getElementById('social-menu-placeholder').innerHTML = html;
	})
	.catch(error => console.error('Error loading social menu:', error));
}

// Load the social menu when the page loads
window.addEventListener("DOMContentLoaded", loadSocialMenu);
