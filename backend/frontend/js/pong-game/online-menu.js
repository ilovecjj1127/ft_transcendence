import { setMenu, drawMenu } from "../menu/select-menu.js"
import { getCanvasContent } from "../menu/main.js"
import { checkToken } from "../profile/refresh-token.js"
import GameOnline from "./pong-online.js"

const canvas = getCanvasContent().canvas
const ctx = getCanvasContent().ctx
const backToMenu = getCanvasContent().backToMenu

const onlineMenu = document.getElementById("online-menu")
const list = document.getElementById("list")
const createButton = document.getElementById("create-game")

export async function onlineMenuFill () {
	
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
    
            button.onclick = () => {
                alert(`Button for ${game.id} clicked!`);
                onlineMenu.style.display = "none"
                let Pong = new GameOnline(game.id)
            };
        })
        onlineMenu.style.display = "block"
        
    } else {
        alert("Cannot retrieve game list!");
    }
}


createButton.addEventListener("click", async function () {
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
        onlineMenu.style.display = "none"
        let Pong = new GameOnline(data.game.id)
        return true
    } else {
        alert("error creating game")
        return false
    }
})

backToMenu.addEventListener("click", function () {
    onlineMenu.style.display = "none" 
    backToMenu.style.display = "none"
    ctx.clearRect(0,0, canvas.width, canvas.height)
    setMenu(true)
    drawMenu()
})