import BlockGame from "../../games/block-game.js";

export const init = () => {
    const overlay = document.querySelector('.overlay')
    const canvas = document.getElementById('gameCanvas')
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    ctx.clearRect( 0,0, canvas.width, canvas.height)
	
	const restart = document.createElement('button')
    restart.id = 'restart-block'
    restart.innerText = 'Restart'
    overlay.appendChild(restart)
	
    const backToMenu = document.createElement('div')
    backToMenu.id = 'back-to-menu'
    backToMenu.innerHTML = `<i class='bx bx-arrow-back'></i>`
    overlay.appendChild(backToMenu)

	let Block = new BlockGame(restart, backToMenu)
	Block.playBlock()
};


