import { handleLogin } from "./login.js"
import { handleLogout } from "./logout.js"
import { getUserToken } from "./userData.js"

const profileToggle = document.querySelector('.profile-toggle')
const dropDownMenu = document.querySelector('.profile-dropdown-menu')

const loggedMenu = [
    {id: 'stats', label: 'Statistics', link: '#'},
    {id: 'settings', label: 'Settings', link: '#'},
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
                a.addEventListener('click', handleLogin) //login function
                break
            case "stats":
                a.addEventListener('click', (e) => {
                    e.preventDefault()
                    location.hash = '/stats'
                })
                break
            case "settings":
                a.addEventListener('click', (e) => {
                    e.preventDefault()
                    location.hash = '/settings'
                })
                break
        }
    })
}

export function createMenuProfile () {
    const accessToken = getUserToken().access
    if (accessToken) {
        createMenu(loggedMenu)
    } else {
        createMenu(notLoggedMenu)
    }
}

function resetCloseTimeout () {
    clearTimeout(closeTimeout)
    closeTimeout = setTimeout(() => {
        dropDownMenu.classList.remove('show')
    }, 3000);
}

//event listeners

profileToggle.addEventListener('click', function (event) {
    event.stopPropagation()
    const isOpen = dropDownMenu.classList.contains('show')
    dropDownMenu.classList.toggle('show')
    if(!isOpen) {
        resetCloseTimeout()
    } else {
        clearTimeout(closeTimeout)
    }
})

dropDownMenu.addEventListener('mouseenter', function () {
    clearTimeout(closeTimeout)
})

dropDownMenu.addEventListener('mouseleave', function () {
    resetCloseTimeout()
})

document.addEventListener('click', function (event) {
    // If the click is outside of the dropdown menu and the profile toggle, close the menu
    if (!profileToggle.contains(event.target) && !dropDownMenu.contains(event.target)) {
        dropDownMenu.classList.remove('show')
        clearTimeout(closeTimeout)
    }
});