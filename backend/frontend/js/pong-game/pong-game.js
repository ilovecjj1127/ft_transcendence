import { setMenu, drawMenu, getPongGameValue, setPongGameOff, setPongGameOn, getPongMenuValue } from "../menu/select-menu.js"
import GameOffline from "./pong-offline.js"
import GameOnline from "./pong-online.js"
import {onlineMenuFill} from "./online-menu.js"
import { getCanvasContent } from "../menu/main.js"

const canvas = getCanvasContent().canvas
const ctx = getCanvasContent().ctx
const backToMenu = getCanvasContent().backToMenu

let Pong
let OnlineGame = false

const modeMenu = document.querySelector(".pong-mode")
const SinglePlayer = document.getElementById("single-player")
const MultiPlayer = document.getElementById("multi-player")
const OnlinePlayer = document.getElementById("online-player")

backToMenu.addEventListener("click", function () {
    if (getPongGameValue()){

        backToMenu.style.display = "none"
        if (!OnlineGame) {
            cancelAnimationFrame(Pong.animationId)
            Pong.animationId = null;
        }
        Pong = null
        ctx.clearRect(0,0, canvas.width, canvas.height)

        setPongGameOff()
        setMenu(true)
        drawMenu()
    }
    else if (getPongMenuValue())
    {
        backToMenu.style.display = "none"
        modeMenu.style.display = "none"
        ctx.clearRect(0,0, canvas.width, canvas.height)

        setMenu(true)
        drawMenu()
    }
})

//Event
addEventListener("keydown", e => {
	if (e.code == "Space" || e.key == "32" || e.key == " " ) {
        if(getPongGameValue() && !OnlineGame) {  //check for online game
            if (Pong.animationId == null)
            Pong.animationId = requestAnimationFrame((time) => Pong.update(time))
        }
	}
})

SinglePlayer.addEventListener("click", function () {
    modeMenu.style.display = "none"
    setPongGameOn()
    Pong = new GameOffline("single")
})

MultiPlayer.addEventListener("click", function () {
    modeMenu.style.display = "none"
    setPongGameOn()
    Pong = new GameOffline("multi")
})

OnlinePlayer.addEventListener("click", function () {
    modeMenu.style.display = "none"
    //show online menu and game list
    onlineMenuFill()
    //onlineMenu.style.display = "block"
    // setPongGameOn()
    // OnlineGame = true
    // Pong = new GameOnline()
})

export function playPong() {
    backToMenu.style.display = "block"
    setMenu(false)
    modeMenu.style.display = "flex"
}
