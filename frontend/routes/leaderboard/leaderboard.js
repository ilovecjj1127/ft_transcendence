
import { checkToken } from "../../../utils/token.js"
import { getUserId, getUserToken } from "../../../utils/userData.js"

export const init = () => {

    const tourInfo = JSON.parse(localStorage.getItem("tourInfo"))
    localStorage.removeItem("tourInfo")
    
    const tourName = document.getElementById('tour-name')
    tourName.innerHTML = tourInfo.name.toUpperCase()
    createLeaderBoard(tourInfo)

    const closeBtn = document.getElementById('leader-close-button')
    closeBtn.addEventListener('click', () => {
        location.hash = '/pong/tournament'
    })
};


async function createLeaderBoard (tourInfo) {
    const isTokenValid = await checkToken()
    if (!isTokenValid) return
    const response = await fetch(`http://${window.location.host}/api/tournament/leaderboard/?tournament_id=${tourInfo.id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
    });
    
    if (response.ok) {
        const data = await response.json()
        for (const player in data) {
            const playerData = data[player]
            createEntry(playerData, player)
        }
    } else {

    }
}

function createEntry(player, name) {
    const list = document.getElementById('players-list')
    const li = document.createElement('li')
    const playerName = document.createElement('strong')
    playerName.innerText = name.toUpperCase() || 'Unknown Player'
    li.appendChild(playerName)
    createDiv("Ranking:", `${player.ranking}`, li)
    createDiv("Game count:", `${player.game_count}`, li)
    createDiv("Game won:", `${player.game_win}`, li)
    createDiv("Total Score:", `${player.total_score}`, li)
    list.appendChild(li)
}

function createDiv(name, info, li) {
    const div = document.createElement('div')
    div.classList.add('board-info')
    div.innerText = name
    const span = document.createElement('span')
    span.innerHTML = info
    div.appendChild(span)
    li.appendChild(div)
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