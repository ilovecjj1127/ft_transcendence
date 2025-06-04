import { checkToken } from "../../../utils/token.js"
import { getUserToken } from "../../../utils/userData.js"
import { DEBUGPRINTS } from "../../../config.js"
import { createScoreModal } from "./onlineplayer.js"
import { startGame } from "./onlineplayer.js"

export async function createGameWithPlayer(PlayerId) {
    const overlay = document.querySelector('.overlay')
    overlay.innerHTML = ''
    overlay.style.display = 'flex';
    overlay.style.zIndex = 1000;
    const score = await createScoreModal()

    const scoreModal = document.getElementById('score-modal')

    if (DEBUGPRINTS) console.log("overlay: ", overlay, "scoreModal: ", scoreModal)


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
                player2: PlayerId,
                winning_score: score
            }),
        });
        if (response.ok) {
            const data = await response.json()
            alert("game created " + data.game.id)
            localStorage.setItem("gameId", data.game.id)
            startGame(data.game)

            if (DEBUGPRINTS) console.log("gameid ;", data.game.id)
            return data.game.id
        } else {
            alert("error creating game")
            return 0
        }
    }
    else
    {
        location.hash = '/'
    }
}
