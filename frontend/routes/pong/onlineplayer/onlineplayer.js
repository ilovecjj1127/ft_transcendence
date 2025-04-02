//!!!!!!!!remove event listeners for onlinegame.js!!!!!!!!!!!

import { checkToken } from "../../../utils/token.js"
import { getUsername, getUserToken } from "../../../utils/userData.js"

export const init = () => {
    const overlay = document.querySelector('.overlay')
    const canvas = document.getElementById('gameCanvas')
    const ctx = document.getElementById('gameCanvas').getContext('2d')
    ctx.clearRect( 0,0, canvas.width, canvas.height)
    createBackToMenu(overlay)
    createMenu(overlay)
};

function createBackToMenu (overlay) {
    const backToMenu = document.createElement('div')
    backToMenu.id = 'back-to-menu'
    backToMenu.innerHTML = `<i class='bx bx-arrow-back'></i>`
    
    overlay.appendChild(backToMenu)
    backToMenu.addEventListener('click', () => {
        location.hash = '/pong'
    })
}

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
                    listButton.textContent = "Start"
                    listButton.addEventListener('click', ()=> startGame(game.id))
                    break
                case "in_progress":
                    status.innerHTML = `${game.status.toUpperCase()}`
                    status.style.color = 'white'
                    listButton.textContent = "Rejoin"
                    listButton.addEventListener('click', ()=> startGame(game.id))
                    break
                case "pending":
                    status.innerHTML = `${game.status.toUpperCase()}`
                    status.style.color = 'orange'
                    if (game.player1_username == getUsername() || game.player2_username == getUsername()) {
                        listButton.textContent = "Cancel"
                        listButton.addEventListener('click', ()=> cancelGame(game.id, li))
                    } else {
                        listButton.textContent = "Join"
                        listButton.addEventListener('click', ()=> joinGame(game.id))
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

async function startGame (gameId) {
    localStorage.setItem("gameId", gameId)
    location.hash = '/pong/onlineplayer/onlinegame'
}

async function joinGame (gameId) {
    const isTokenValid = await checkToken()
    if (!isTokenValid) return
    
    const response = await fetch(`http://${window.location.host}/api/games/join/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
        body: JSON.stringify({game_id: gameId}),
    });
    if (response.ok) {
        alert("game joined " +  gameId)
        localStorage.setItem("gameId", gameId)
        location.hash = '/pong/onlineplayer/onlinegame'
        return true
    } else {
        alert("error joining game")
        return false
    }
}

async function cancelGame(gameId, li) {
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
    if (response.ok) {
        alert("game cancelled " +  gameId)
        li.remove()
        return true
    } else {
        alert("error cancelling game")
        return false
    }
}

function createNewGameButton (menu) {
    const newGame = document.createElement('button')
    newGame.id = 'new-game'
    newGame.innerText = 'Create new game'
    menu.appendChild(newGame)
    
    newGame.addEventListener("click", async function () {
        const isTokenValid = await checkToken()
        if (!isTokenValid) return
    
        const response = await fetch(`http://${window.location.host}/api/games/create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getUserToken().access}`
            },
            body: JSON.stringify({player2: null}),
        });
        if (response.ok) {
            const data = await response.json()
            alert("game created " + data.game.id)
            localStorage.setItem("gameId", data.game.id)
            location.hash = '/pong/onlineplayer/onlinegame'
            return true
        } else {
            alert("error creating game")
            return false
        }
    })
}
