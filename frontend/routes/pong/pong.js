import { createBackToMenu } from "../../utils/canvas-utils.js";

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

    const buttons = ["Single Player", "MultiPlayer", "Online Player", "Tournament"]
    buttons.forEach(button => {
        const btn = document.createElement('button')
        btn.textContent = button
        btn.id = button.toLowerCase().replace(/\s+/g, '')
        btn.classList.add('pongMode')
        btnContainer.appendChild(btn)

        btn.addEventListener('click', () => {
            location.hash = `/pong/${btn.id}`
        })
    })

    overlay.appendChild(btnContainer)
}