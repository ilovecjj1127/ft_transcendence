export const init = () => {
    
    //maybe canvas utils file
    const overlay = document.querySelector('.overlay')
    const canvas = document.getElementById('gameCanvas')
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    ctx.clearRect( 0,0, canvas.width, canvas.height)
    
    if (!overlay.querySelector('.menuImg')){

        const pongImg = document.createElement('img')
        pongImg.src = "../media/pong.jpg"
        pongImg.classList.add('menuImg')
        
        const blockImg = document.createElement('img')
        blockImg.src = "../media/block.png"
        blockImg.classList.add('menuImg')
        
        const imgSize = 250 //here to decided the images size
        const totalWidth = imgSize * 2
        const spaceBetween = (canvas.width - totalWidth) / 3
        
        
        const posY = (canvas.height - imgSize) / 2
        const pongX = spaceBetween
        const blockX = spaceBetween * 2 + imgSize
        
        pongImg.style.left = `${pongX}px`
        pongImg.style.top = `${posY}px`
        pongImg.style.height = `${imgSize}px`
        pongImg.style.width = `${imgSize}px`
        
        blockImg.style.left = `${blockX}px`
        blockImg.style.top = `${posY}px`
        blockImg.style.height = `${imgSize}px`
        blockImg.style.width = `${imgSize}px`
        
        overlay.appendChild(pongImg)
        overlay.appendChild(blockImg)
        
        function deleteEvents() {
            blockImg.removeEventListener('click', changeBlock)
            pongImg.removeEventListener('click', changePong)
        }

        function changeBlock () {
            deleteEvents()
            location.hash = '/block'
        }

        function changePong () {
            deleteEvents()
            location.hash = '/pong'
        }

        blockImg.addEventListener('click', changeBlock)
        
        pongImg.addEventListener('click', changePong)
    }
}
