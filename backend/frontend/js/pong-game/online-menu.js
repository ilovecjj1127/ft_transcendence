import { setMenu, drawMenu } from "../menu/select-menu.js"
import { getCanvasContent } from "../menu/main.js"
import { checkToken } from "../profile/refresh-token.js"

const canvas = getCanvasContent().canvas
const ctx = getCanvasContent().ctx
const backToMenu = getCanvasContent().backToMenu

const onlineMenu = document.getElementById("online-menu")
const list = document.getElementById("list")
const createButton = document.getElementById("")

export async function onlineMenuFill () {
    if (!checkToken()) return
    list.innerHTML = ""
    const accessToken = localStorage.getItem('access_token')
    const response = await fetch(`http://${window.location.host}/api/games/show/`, {
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
            li.textContent = game.id
            const button = document.createElement("button")
            button.textContent = "Join"
            li.appendChild(button)
            list.appendChild(li)
    
            button.onclick = () => {
                alert(`Button for ${game.id} clicked!`);
            };
        })
        onlineMenu.style.display = "block"

    } else {
        alert("Cannot retrieve game list!");
    }
}


backToMenu.addEventListener("click", function () {
    onlineMenu.style.display = "none" 
    backToMenu.style.display = "none"
    ctx.clearRect(0,0, canvas.width, canvas.height)
    setMenu(true)
    drawMenu()
})