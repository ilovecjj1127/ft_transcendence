
// import { checkToken } from "../../../utils/token.js"
// import { getUserId, getUserToken } from "../../../utils/userData.js"

export const init = () => {
    const overlay = document.querySelector('.overlay')
    const canvas = document.getElementById('gameCanvas')
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    ctx.clearRect( 0,0, canvas.width, canvas.height)
    createBackToMenu(overlay)

    const tour_id = localStorage.getItem("tour_id")
    localStorage.removeItem("tour_id")

    console.log("leaderboard for tournament ", tour_id)
};

function createBackToMenu (overlay) {
    const backToMenu = document.createElement('div')
    backToMenu.id = 'back-to-menu'
    backToMenu.innerHTML = `<i class='bx bx-arrow-back'></i>`

    overlay.appendChild(backToMenu)
    
    function back () {
        backToMenu.removeEventListener('click', back)
        location.hash = "/pong/tournament"
    }

    backToMenu.addEventListener('click', back)
}


// {
//   "dudu": {
//     "game_count": 0,
//     "game_win": 0,
//     "total_score": 0,
//     "ranking": 1
//   },
//   "hello": {
//     "game_count": 0,
//     "game_win": 0,
//     "total_score": 0,
//     "ranking": 1
//   },
//   "dood": {
//     "game_count": 0,
//     "game_win": 0,
//     "total_score": 0,
//     "ranking": 1
//   }
// }

//on error show leaderboard not ready for this tour