const profileToggle = document.querySelector('.profile-toggle')
const dropDownMenu = document.querySelector('.profile-dropdown-menu')
const logoutButton = document.getElementById('logout')


profileToggle.addEventListener('click', function () {
	dropDownMenu.classList.toggle('show')
})

logoutButton.addEventListener("click", async () => {
    
    const response = await fetch(`http://${window.location.host}/api/users/logout/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });
    
    if (response.ok) {
        const data = await response.json()
        localStorage.removeItem('access_token')
        alert("Succesfully logged out")
        setTimeout( () => {
            window.location.reload()
        }, 3000)
    } else {
        alert("Logout failed, please try again")
    }    
})