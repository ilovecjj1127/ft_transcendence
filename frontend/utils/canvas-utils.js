import {showLoginModal} from "./modals.js"


export function createNotLoggedMessage(overlay) {
    const msgContainer = document.createElement('div')
    msgContainer.id = 'not-logged-container'
    const span = document.createElement('span')
    span.innerHTML = "You are not logged in, log in to use this service"
    const loginButton = document.createElement('button')
    loginButton.innerText = "Login"

    loginButton.addEventListener('click', async () => {
        let logged = await showLoginModal()
        if (logged)
            window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    msgContainer.appendChild(span)
    msgContainer.appendChild(loginButton)
    overlay.appendChild(msgContainer)
}

export function createBackToMenu (overlay, hash) {
    const backToMenu = document.createElement('div')
    backToMenu.id = 'back-to-menu'
    backToMenu.innerHTML = `<i class='bx bx-arrow-back'></i>`
    
    overlay.appendChild(backToMenu)
    
    function back () {
        backToMenu.removeEventListener('click', back)
        location.hash = hash
    }

    backToMenu.addEventListener('click', back)
}

export function createRefresh (overlay) {
    const refreshMenu = document.createElement('div')
    refreshMenu.id = 'refresh-menu'
    refreshMenu.innerHTML = `<i class='bx bx-refresh'></i>`
    
    overlay.appendChild(refreshMenu)
    
    function refresh () {
        refreshMenu.removeEventListener('click', refresh)
        window.dispatchEvent(new HashChangeEvent('hashchange'))
    }

    refreshMenu.addEventListener('click', refresh)
}