import { checkToken, deleteTokenReload } from "../../../../utils/token.js"
import { getUserId, getUserToken, getUsername, getLanguage} from "../../../../utils/userData.js"
import { translations } from "../../../../multilang/dictionary.js"

//list of next games to play (show/ready/games)
export function createUpcomingGames (container) {
    const listContainer = document.createElement('div')
    listContainer.classList.add('dropdown')
    const listBtn = document.createElement('button')
    listBtn.classList.add('dropdown-button')
    listBtn.innerText = translations[getLanguage()]['upGames']
    const list = document.createElement('ul')
    list.classList.add('dropdown-list')

    listBtn.addEventListener('click', () => requestList(list, listContainer))
    
    listContainer.appendChild(list)
    listContainer.appendChild(listBtn)
    container.appendChild(listContainer)
}

async function requestList (list, listContainer) {
    list.innerHTML = ''

    const isTokenValid = await checkToken()
    if (!isTokenValid) return

    const listResponse = await fetch(`http://${window.location.host}/api/tournament/show/ready/games`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
    });
    if (listResponse.status == 401) deleteTokenReload()
    if (listResponse.ok) {
        const data = await listResponse.json()
        if (data.length === 0) {
            const noTournamentsMessage = document.createElement('p')
            noTournamentsMessage.textContent = translations[getLanguage()]['noGames']
            list.appendChild(noTournamentsMessage)
        } else {
            data.forEach((game) => {
                const li = document.createElement('li')
                li.innerHTML = `${game.id} 
                ${
                    game.player1_username && game.player1_username !== getUsername()
                        ? '- vs ' + game.player1_alias
                        : '- vs ' + game.player2_alias
                }
                ${game.tournament ? " - TOURNAMENT: " + game.tournament : ''}`
                const button = document.createElement('button')
                button.innerText = translations[getLanguage()]['play']
                li.appendChild(button)
                list.appendChild(li)
                button.addEventListener('click', ()=> playGame(game))
            })
        }
    } else {
        const li = document.createElement()
        li.textContent = translations[getLanguage()]['tourError']
        list.appendChild(li)
    }

    //maybe this part at the beggining with a return to not send the request if not showing the list
    list.classList.toggle('show')
    if (list.classList.contains('show')) {
        listContainer.style.marginBottom = `${list.offsetHeight + 10}px`
    } else {
        listContainer.style.marginBottom = ''
    }
}

async function playGame (game) {
    const gameInfo = {}
    gameInfo.gameId = game.id
    gameInfo.winScore = game.winning_score
    gameInfo.hash = '/pong/tournament'
    if (game.tournament) {
        gameInfo.player1 = game.player1_alias
        gameInfo.player2 = game.player2_alias
    } else {
        gameInfo.player1 = game.player1_username
        gameInfo.player2 = game.player2_username
    }
    
    localStorage.setItem("gameInfo", JSON.stringify(gameInfo))
    location.hash = '/pong/tournament/tournamentgame'
}