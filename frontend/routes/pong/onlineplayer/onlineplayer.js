import { removeGameNotification } from "../../../social/notification-storage.js";
import { createNotLoggedMessage, createBackToMenu, createRefresh } from "../../../utils/canvas-utils.js"
import { checkToken, deleteTokenReload} from "../../../utils/token.js"
import { getUsername, getUserToken, getLanguage } from "../../../utils/userData.js"
import { translations } from "../../../multilang/dictionary.js";

export const init = () => {
    const overlay = document.querySelector('.overlay')
    const canvas = document.getElementById('gameCanvas')
    const ctx = document.getElementById('gameCanvas').getContext('2d')
    ctx.clearRect( 0,0, canvas.width, canvas.height)
    createBackToMenu(overlay, '/pong')
    if (getUserToken().access) {
        createMenu(overlay)
        createRefresh(overlay)
    } else {
        createNotLoggedMessage(overlay)
    }
};



function createMenu (overlay) {
    const menu = document.createElement('div')
    menu.id = 'menu'
    createNewGameButton(menu)
    createGameList(menu)
    overlay.appendChild(menu)
}

function createGameList (menu) {
    const lstContainer = document.createElement('div')
    lstContainer.id = 'list-container'
    const list = document.createElement('ul')
    list.id = 'list'
    createGamesList(list)
    lstContainer.appendChild(list)
    menu.appendChild(lstContainer)
} 

async function createGamesList (list) {
    
    const isTokenValid = await checkToken()
    
    if (!isTokenValid) return
    list.innerHTML = ""

    //Fill with games
    const listGamesResponse = await fetch(`http://${window.location.host}/api/games/show/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
    });
    if (listGamesResponse.status == 401) deleteTokenReload()
    if (listGamesResponse.ok) {
        const data = await listGamesResponse.json();
        
        data.forEach((game) => {
            
            const li = document.createElement("li")

            const gameDetails = document.createElement('div')
            gameDetails.classList.add('game-details')
            gameDetails.innerHTML = `${game.id} 
            ${
                game.player1_username && game.player1_username !== getUsername()
                    ? '- vs ' + game.player1_username
                    : game.player1_username === getUsername() && !game.player2_username
                    ? '- WAITING FOR OPPONENT'
                    : ''
            }
            ${
                game.player2_username && game.player2_username !== getUsername()
                    ? '- vs ' + game.player2_username
                    : game.player2_username === getUsername() && !game.player1_username
                    ? '- WAITING FOR OPPONENT'
                    : ''
            } 
            ${game.tournament ? " - TOURNAMENT: " + game.tournament : ''}`
            
            const status = document.createElement('span')
            const listButton = document.createElement("button")
            
            switch (game.status){
                case "ready":
                    status.innerHTML = `${game.status.toUpperCase()}`
                    status.style.color = 'green'
                    listButton.textContent = translations[getLanguage()]['start']
                    listButton.addEventListener('click', ()=> startGame(game))
                    break
                case "in_progress":
                    status.innerHTML = `${game.status.toUpperCase()}`
                    status.style.color = 'white'
                    listButton.textContent = translations[getLanguage()]['rejoin']
                    listButton.addEventListener('click', ()=> startGame(game))
                    break
                case "pending":
                    status.innerHTML = `${game.status.toUpperCase()}`
                    status.style.color = 'orange'
                    if (game.player1_username == getUsername() || game.player2_username == getUsername()) {
                        listButton.textContent = translations[getLanguage()]['cancel']
                        listButton.addEventListener('click', ()=> cancelGame(game.id, li, listButton))
                    } else {
                        listButton.textContent = translations[getLanguage()]['join']
                        listButton.addEventListener('click', ()=> joinGame(game, listButton))
                    }
                    break
            }

            li.appendChild(gameDetails);
            li.appendChild(status)
            li.appendChild(listButton)
            list.appendChild(li)
        })        
    } else {
        alert("Cannot retrieve ready game list!");
    }
}

async function startGame (game) {
    const gameInfo = {}
    gameInfo.gameId = game.id
    gameInfo.winScore = game.winning_score
    gameInfo.hash = '/pong/onlineplayer'
    if (game.tournament) {
        gameInfo.player1 = game.player1_alias
        gameInfo.player2 = game.player2_alias
    } else if (game.player1_username || game.player2_username){
        gameInfo.player1 = game.player1_username || getUsername()
        gameInfo.player2 = game.player2_username || getUsername()
    }
    removeGameNotification(game.id)
    localStorage.setItem("gameInfo", JSON.stringify(gameInfo))
    location.hash = '/pong/onlineplayer/onlinegame'
}

async function joinGame (game, button) {
    const isTokenValid = await checkToken()
    if (!isTokenValid) return
    const response = await fetch(`http://${window.location.host}/api/games/join/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
        body: JSON.stringify({game_id: game.id}),
    });
    if (response.status == 401) deleteTokenReload()
    if (response.ok) {
        alert("game joined " +  game.id )
        startGame(game)
        return true
    } else {
        button.innerText = translations[getLanguage()]['error']
        button.style.backgroundColor = "red"
        button.style.color = "white"
        button.disabled = true
        return false
    }
}

async function cancelGame(gameId, li, button) {
    const isTokenValid = await checkToken()
    if (!isTokenValid) return
    
    const response = await fetch(`http://${window.location.host}/api/games/cancel/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
        body: JSON.stringify({game_id: gameId}),
    });
    if (response.status == 401) deleteTokenReload()
    if (response.ok) {
        li.remove()
        return true
    } else {
        button.innerText = translations[getLanguage()]['error']
        button.style.backgroundColor = "red"
        button.style.color = "white"
        button.disabled = true
        return false
    }
}

function createNewGameButton (menu) {

    const newGame = document.createElement('button')
    newGame.id = 'new-game'
    newGame.innerText = translations[getLanguage()]['createGame']
    menu.appendChild(newGame)
    
    newGame.addEventListener("click", async function () {
        const score = await createScoreModal()
        if (score) {
            const isTokenValid = await checkToken()
            if (!isTokenValid) return
            
            const response = await fetch(`http://${window.location.host}/api/games/create/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getUserToken().access}`
                },
                body: JSON.stringify({
                    player2: null,
                    winning_score: score,
                }),
            });
            if (response.status == 401) deleteTokenReload()
            if (response.ok) {
                const data = await response.json()
                startGame(data.game)
                //window.dispatchEvent(new HashChangeEvent('hashchange'));
                return true
            } else {
                newGame.innerText = translations[getLanguage()]['error']
                newGame.style.backgroundColor = "red"
                newGame.style.color = "white"
                newGame.disabled = true
                return false
            }
        }
    })
}

async function createScoreModal() {
    return new Promise((resolve) => {
        const overlay = document.querySelector('.overlay')
        const scoreModal = document.createElement('div')
        scoreModal.id = 'score-modal'
        
        const scoreInput = document.createElement('input')
        scoreInput.id = 'score-input'
        scoreInput.type = 'number'
        scoreInput.min = 1
        scoreInput.max = 20
        const scoreMessage = document.createElement('p')
        scoreMessage.innerText = translations[getLanguage()]['setScore']
        
        
        const confirmButton = document.createElement('button')
        confirmButton.id = 'confirm-button'
        confirmButton.innerText = translations[getLanguage()]['confirm']
        confirmButton.addEventListener('click', () => {
            let score = parseInt(scoreInput.value, 10);
            if (!score || score < 1 || score > 20) {
                scoreInput.value = ""
                scoreInput.placeholder = translations[getLanguage()]['validValuePlaceholder']
                scoreInput.style.border = '2px solid red';
                return;
            }
            scoreModal.remove()
            resolve(score)
        })
        
        const cancelButton = document.createElement('button')
        cancelButton.id = 'cancel-new-game'
        cancelButton.innerText = translations[getLanguage()]['cancel']
        cancelButton.addEventListener('click', () => {
            scoreModal.remove()
            resolve(null)
        })
        
        const btnContainer = document.createElement('div')
        btnContainer.id = "score-btn-container"

        scoreModal.appendChild(scoreMessage)
        scoreModal.appendChild(scoreInput)
        btnContainer.appendChild(confirmButton)
        btnContainer.appendChild(cancelButton)
        scoreModal.appendChild(btnContainer)
        
        overlay.appendChild(scoreModal)
    })
}
