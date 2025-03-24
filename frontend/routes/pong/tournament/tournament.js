export const init = () => {
    const overlay = document.querySelector('.overlay')
    const canvas = document.getElementById('gameCanvas')
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    ctx.clearRect( 0,0, canvas.width, canvas.height)
    createBackToMenu(overlay)
    
    
    // //extracting parameters on route change
    // const params = new URLSearchParams(location.search)
    // const message = params.get('message')
    console.log("in single player")
};

function createBackToMenu (overlay) {
    const backToMenu = document.createElement('div')
    backToMenu.id = 'back-to-menu'
    backToMenu.innerHTML = `<i class='bx bx-arrow-back'></i>`

    overlay.appendChild(backToMenu)
    
    function back () {
        backToMenu.removeEventListener('click', back)
        location.hash = "/pong"
    }

    backToMenu.addEventListener('click', back)
}