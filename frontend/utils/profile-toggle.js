import { showLoginModal } from "./modals.js"
import { handleLogout } from "./logout.js"

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

export function createMenuProfile () {
    const accessToken = localStorage.getItem('access_token')
    if (accessToken) {
        createMenu(loggedMenu)
    } else {
        createMenu(notLoggedMenu)
    }
}

//event listeners

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
