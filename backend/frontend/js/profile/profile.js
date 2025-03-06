const profileToggle = document.querySelector('.profile-toggle')
const dropDownMenu = document.querySelector('.profile-dropdown-menu')
const logoutButton = document.getElementById('logout')


profileToggle.addEventListener('click', function () {
	dropDownMenu.classList.toggle('show')
})

logoutButton.addEventListener("click", async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    const accessToken = localStorage.getItem('access_token')

    const response = await fetch(`http://${window.location.host}/api/users/logout/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({refresh: refreshToken}),
    });
    
    if (response.ok) {
        const data = await response.json()
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        alert("Succesfully logged out")
        setTimeout( () => {
            window.location.reload()
        }, 3000)
    } else {
        alert("Logout failed, please try again")
    }    
})