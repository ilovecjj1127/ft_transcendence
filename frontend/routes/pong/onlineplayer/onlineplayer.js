//!!!!!!!!remove event listeners for onlinegame.js!!!!!!!!!!!

import { checkToken } from "../../../utils/token.js"
import { getUserToken } from "../../../utils/userData.js"

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

    //Fill with pending games
    const pendingGamesResponse = await fetch(`http://${window.location.host}/api/games/show/pending`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
    });

    if (pendingGamesResponse.ok) {
        const data = await pendingGamesResponse.json();
        
        
        data.forEach((game) => {
            const li = document.createElement("li")
            li.textContent = 'vs - ' + game.player1
            li.setAttribute('data-id', game.id + ' -')
            
            const button = document.createElement("button")
            button.textContent = "Join"
            
            li.appendChild(button)
            list.appendChild(li)
    
            button.onclick = async () => {

                alert(`Button for ${game.id} clicked!`);

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
                if (response.ok) {
                    alert("game joined " +  game.id)
                    localStorage.setItem("gameId", game.id)
                    location.hash = '/pong/onlineplayer/onlinegame'
                    return true
                } else {
                    alert("error joining game")
                    return false
                }
            };
        })        
    } else {
        alert("Cannot retrieve pending game list!");
    }

    //Fill with ready games
    const readyGamesResponse = await fetch(`http://${window.location.host}/api/games/show/ready`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
    });

    if (readyGamesResponse.ok) {
        const data = await readyGamesResponse.json();
        
        data.forEach((game) => {
            
            const li = document.createElement("li")
            li.textContent = 'vs - ' + game.player1
            li.setAttribute('data-id', game.id + ' -')
            
            const buttonContainer = document.createElement('div')
            buttonContainer.classList.add("button-container")

            const joinButton = document.createElement("button")
            joinButton.textContent = "Rejoin"
            buttonContainer.appendChild(joinButton)
            
            const cancelButton = document.createElement("button")
            cancelButton.textContent = "Cancel"
            buttonContainer.appendChild(cancelButton)
            
            li.appendChild(buttonContainer)
            list.appendChild(li)
            
            cancelButton.onclick = async () => {

                alert(`Button to cancel ${game.id} clicked!`);

                const isTokenValid = await checkToken()
                if (!isTokenValid) return
                
                const response = await fetch(`http://${window.location.host}/api/games/cancel/`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${getUserToken().access}`
                    },
                    body: JSON.stringify({game_id: game.id}),
                });
                if (response.ok) {
                    alert("game cancelled " +  game.id)
                    li.remove()
                    return true
                } else {
                    alert("error cancelling game")
                    return false
                }
            }

            joinButton.onclick = async () => {

                alert(`Button for ${game.id} clicked!`);
                    localStorage.setItem("gameId", game.id)
                    location.hash = '/pong/onlineplayer/onlinegame'
            }
        })        
    } else {
        alert("Cannot retrieve ready game list!");
    }
}

function createNewGameButton (menu) {
    const newGame = document.createElement('button')
    newGame.id = 'new-game'
    newGame.innerText = 'Create new game'
    menu.appendChild(newGame)
    
    newGame.addEventListener("click", async function () {
        return createGame()
    })
}

export default async function createGame() {
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
}


export async function createGameWithPlayer(PlayerId) {
    const isTokenValid = await checkToken()
    if (!isTokenValid) return

    const response = await fetch(`http://${window.location.host}/api/games/create/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
        body: JSON.stringify({player2: PlayerId}),
    });
    if (response.ok) {
        const data = await response.json()
        alert("game created " + data.game.id)
        localStorage.setItem("gameId", data.game.id)
        location.hash = '/pong/onlineplayer/onlinegame'
        console.log("gameid ;", data.game.id)
        return data.game.id
    } else {
        alert("error creating game")
        return 0
    }
}

export async function createGameReturnId() {
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
        return data.game.id
    } else {
        alert("error creating game")
        return 0
    }
}
