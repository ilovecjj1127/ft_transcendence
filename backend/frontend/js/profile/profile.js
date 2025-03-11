import { showLoginModal } from "../menu/main.js"
import { checkToken } from "./refresh-token.js"

const profileToggle = document.querySelector('.profile-toggle')
const dropDownMenu = document.querySelector('.profile-dropdown-menu')

const loggedMenu = [
    {id: 'stats', label: 'Statistics', link: '#'},
    {id: 'logout', label: 'Logout', link: '#'},
]

const notLoggedMenu = [ {id: 'login', label: 'Login', link: '#'}] 

let closeTimeout

function createMenu (items) {
    dropDownMenu.innerHTML = ''
    items.forEach(item => {
        const li = document.createElement('li')
        const a = document.createElement('a')

        a.href = item.link
        a.id = item.id
        a.innerText = item.label

        li.appendChild(a);
        dropDownMenu.appendChild(li)
        switch (item.id) {
            case "logout":
                a.addEventListener('click', handleLogout)
                break
            case "login":
                a.addEventListener('click', showLoginModal)
                break
        }
    })
}

async function handleLogout (e) {
    e.preventDefault()
	
	const isTokenValid = await checkToken()
	if (!isTokenValid) return
    
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
        }, 1000)
    } else {
        alert("Logout failed, please try again")
    }
}

export function createMenuProfile () {
    const accessToken = localStorage.getItem('access_token')
    if (accessToken) {
        createMenu(loggedMenu)
    } else {
        createMenu(notLoggedMenu)
    }
}

profileToggle.addEventListener('click', function () {
	dropDownMenu.classList  .toggle('show')

    if (dropDownMenu.classList.contains('show'))
    {
        closeTimeout = setTimeout(() => {
            dropDownMenu.classList.remove('show')
        }, 3000);
    }
})

dropDownMenu.addEventListener('mouseenter', function () {
    clearTimeout(closeTimeout)
})

dropDownMenu.addEventListener('mouseleave', function () {
    closeTimeout = setTimeout(() => {
        dropDownMenu.classList.remove('show')
    }, 3000)
})
