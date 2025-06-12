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
    const score = await createScoreModal_v2_for_chat()

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

// with help from chatgpt

// note; something to do with ;this.winScore = gameInfo.winScore
// (about err/why wasnt workin - about the undefined score)
//

export async function createScoreModal_v2_for_chat() {
    const overlay = document.querySelector('.overlay');
    const scoreModal = document.createElement('div');
    scoreModal.id = 'score-modal';
    scoreModal.style.display = 'flex'; // Add styling to ensure it's visible immediately
    scoreModal.style.flexDirection = 'column';
    scoreModal.style.alignItems = 'center';
    scoreModal.style.padding = '20px';
    scoreModal.style.backgroundColor = '#ffffff';
    scoreModal.style.borderRadius = '10px';
    scoreModal.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    scoreModal.style.zIndex = '1001';

    const scoreInput = document.createElement('input');
    scoreInput.id = 'score-input';
    scoreInput.type = 'number';
    scoreInput.min = 1;
    scoreInput.max = 20;

    const scoreMessage = document.createElement('p');
    scoreMessage.innerText = 'Choose the winning score for this game (1 - 20)';
    scoreMessage.style.color = 'red'
    const confirmButton = document.createElement('button');
    confirmButton.id = 'confirm-button';
    confirmButton.innerText = 'Confirm';

    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancel-new-game';
    cancelButton.innerText = 'Cancel';

    const btnContainer = document.createElement('div');
    btnContainer.id = "score-btn-container";
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '10px';
    btnContainer.style.marginTop = '10px';

    btnContainer.appendChild(confirmButton);
    btnContainer.appendChild(cancelButton);

    scoreModal.appendChild(scoreMessage);
    scoreModal.appendChild(scoreInput);
    scoreModal.appendChild(btnContainer);

    overlay.appendChild(scoreModal);

    return new Promise((resolve) => {
        confirmButton.addEventListener('click', () => {
            let score = parseInt(scoreInput.value, 10);
            if (!score || score < 1 || score > 20) {
                scoreInput.value = "";
                scoreInput.placeholder = "Insert a valid value";
                scoreInput.style.border = '2px solid red';
                return;
            }
            scoreModal.remove();
            resolve(score);
        });

        cancelButton.addEventListener('click', () => {
            scoreModal.remove();
            resolve(null);
        });
    });
}
