import { checkToken } from "../../../utils/token.js"

export const init = () => {
    const overlay = document.querySelector('.overlay')
    const canvas = document.getElementById('gameCanvas')
    const ctx = document.getElementById('gameCanvas').getContext('2d');
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
    const accessToken = localStorage.getItem('access_token')
    const response = await fetch(`http://${window.location.host}/api/games/show/pending`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
    });

    if (response.ok) {
        const data = await response.json();
        
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
                
                const accessToken = localStorage.getItem('access_token')
                const response = await fetch(`http://${window.location.host}/api/games/join/`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
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
        alert("Cannot retrieve game list!");
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
        
        const accessToken = localStorage.getItem('access_token')
    
        const response = await fetch(`http://${window.location.host}/api/games/create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
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

