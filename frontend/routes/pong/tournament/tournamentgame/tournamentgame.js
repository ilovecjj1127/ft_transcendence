import PongOnline from "../../../../games/pong-online.js";
import { getLanguage } from "../../../../utils/userData.js";
import { translations } from "../../../../multilang/dictionary.js";

let Pong

export const init = () => {
    const overlay = document.querySelector('.overlay')
    const canvas = document.getElementById('gameCanvas')
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    ctx.clearRect( 0,0, canvas.width, canvas.height)
    
    const backToMenu = document.createElement('div')
    backToMenu.id = 'back-to-menu'
    backToMenu.innerHTML = `<i class='bx bx-arrow-back'></i>`
    overlay.appendChild(backToMenu)
    
    Pong = new PongOnline()

    function exitCheck() {
        const exitContainer = document.createElement('div')
        exitContainer.id = 'exit-container'

        const exitMessage = document.createElement('p')
        exitMessage.innerText = translations[getLanguage()]['exitMsg']

        const yesButton = document.createElement('button')
        yesButton.id = 'exit-yes'
        yesButton.innerText = translations[getLanguage()]['yes']
        yesButton.addEventListener('click', () => {
            back()
            exitContainer.remove()
            backToMenu.addEventListener('click', exitCheck)
        })

        const noButton = document.createElement('button')
        noButton.id = 'exit-no'
        noButton.innerText = translations[getLanguage()]['yes']
        noButton.addEventListener('click', () => {
            exitContainer.remove()
            backToMenu.addEventListener('click', exitCheck)
        })

        exitContainer.appendChild(exitMessage)
        exitContainer.appendChild(yesButton)
        exitContainer.appendChild(noButton)

        
        overlay.appendChild(exitContainer)
        backToMenu.removeEventListener('click', exitCheck )
    }

    function back () {
        backToMenu.removeEventListener('click', exitCheck )
        Pong.stop()
        localStorage.removeItem('gameInfo')
    }

    function handleBackBrowser () {
        window.removeEventListener('popstate', handleBackBrowser)
        Pong.stop()
        location.hash = '/pong/tournament'
    }

    window.addEventListener('popstate', handleBackBrowser)
    backToMenu.addEventListener('click', exitCheck)
};