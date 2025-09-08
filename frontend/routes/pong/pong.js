import { createBackToMenu } from "../../utils/canvas-utils.js";
import { getLanguage } from "../../utils/userData.js";
import { translations } from "../../multilang/dictionary.js";

export const init = () => {
    const overlay = document.querySelector('.overlay')
    const canvas = document.getElementById('gameCanvas')
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    ctx.clearRect( 0,0, canvas.width, canvas.height)
    createBackToMenu(overlay, '/')
    createModeButtons(overlay)
};

function createModeButtons (overlay) {
    const btnContainer = document.createElement('div')
    btnContainer.classList.add('mode-container')

    const buttons = [
                    {id: 'singleplayer', label: translations[getLanguage()]['single']},
                    {id: 'multiplayer', label: translations[getLanguage()]['multi']},
                    {id: 'onlineplayer', label: translations[getLanguage()]['online']},
                    {id: 'tournament', label: translations[getLanguage()]['tour']}
                ]
    buttons.forEach(button => {
        const btn = document.createElement('button')
        btn.textContent = button.label
        btn.id = button.id.toLowerCase().replace(/\s+/g, '')
        btn.classList.add('pongMode')
        btnContainer.appendChild(btn)

        btn.addEventListener('click', () => {
            location.hash = `/pong/${btn.id}`
        })
    })

    overlay.appendChild(btnContainer)
}