import BlockGame from "../../games/block-game.js";
import { translations } from "../multilang/dictionary.js"
import { getLanguage } from "../../utils/userData.js";

let Block

export const init = () => {
    if (Block) {
        Block.destroy()
    }
    
    const overlay = document.querySelector('.overlay')
    const canvas = document.getElementById('gameCanvas')
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    ctx.clearRect( 0,0, canvas.width, canvas.height)
	
	const restart = document.createElement('button')
    restart.id = 'restart-block'
    restart.innerText =  translations[getLanguage()]['restart']
    overlay.appendChild(restart)
	
    const backToMenu = document.createElement('div')
    backToMenu.id = 'back-to-menu'
    backToMenu.innerHTML = `<i class='bx bx-arrow-back'></i>`
    overlay.appendChild(backToMenu)

	Block = new BlockGame(restart)
	Block.playBlock()

    function back () {
        Block.stop()
        backToMenu.removeEventListener('click', back)
    }
    
    backToMenu.addEventListener('click', back)
};