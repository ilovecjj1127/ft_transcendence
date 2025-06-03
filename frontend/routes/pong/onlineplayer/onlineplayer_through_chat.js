import { checkToken } from "../../../utils/token.js"
import { getUserToken } from "../../../utils/userData.js"
import { DEBUGPRINTS } from "../../../config.js"

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
        // location.hash = '/pong/onlineplayer/onlinegame'
        if (DEBUGPRINTS) console.log("gameid ;", data.game.id)
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
        // location.hash = '/pong/onlineplayer/onlinegame'
        return data.game.id
    } else {
        alert("error creating game")
        return 0
    }
}
