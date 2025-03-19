import PongOffline from "../../../games/pong-offline.js";

let Pong

export const init = () => {
    if (Pong){
        Pong.destroy()
    }

    const overlay = document.querySelector('.overlay')
    const canvas = document.getElementById('gameCanvas')
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    ctx.clearRect( 0,0, canvas.width, canvas.height)
    
    const backToMenu = document.createElement('div')
    backToMenu.id = 'back-to-menu'
    backToMenu.innerHTML = `<i class='bx bx-arrow-back'></i>`
    overlay.appendChild(backToMenu)
    
    Pong = new PongOffline('multi', backToMenu)

    backToMenu.addEventListener('click', () => {
        Pong.stop()
    })
};