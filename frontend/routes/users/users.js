import { getUserToken, getLanguage } from "../../utils/userData.js"
import { checkToken, deleteTokenReload } from "../../utils/token.js"
import { translations } from "../../multilang/dictionary.js"

export const init = () => {
    const username = document.getElementById('users-username')
    const profileImg = document.getElementById('users-img')
    const closeBtn = document.getElementById('users-close-button')
    closeBtn.innerHTML = `<i class='bx bx-x-circle'></i>`
    
    const user = localStorage.getItem("userSearched")
    localStorage.removeItem("userSearched")
    username.innerText = user

    getUserSearched()
    
    function closeStats () {
        deleteStatsEvents()
        location.hash = '/'
    }
    
    // get user stats and save it in stats variable
    async function getUserSearched () {
        const isTokenValid = await checkToken()
        
        if (!isTokenValid) return
        
        const searchUser = await fetch(`http://${window.location.host}/api/users/?username=${user}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getUserToken().access}`
            },
        });
        if (searchUser.status == 401) deleteTokenReload()
        if (searchUser.ok)
        {
            const userSearched = await searchUser.json()
            profileImg.src = userSearched.avatar
            getUserHistory()
       } else {
            console.log("user search error")
        }
    }

    async function getUserHistory() {
        const isTokenValid = await checkToken()
        if (!isTokenValid) return

        const historyResponse = await fetch(`http://${window.location.host}/api/games/history/?username=${user}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getUserToken().access}`
            },
        });
        if (historyResponse.status == 401) deleteTokenReload()
        if (historyResponse.ok) {
            const history = await historyResponse.json()
            for (const game in history) {
                createEntry(history[game])
            }
        }
        else
        {
            const history = document.getElementById("users-history-list")
            const li = document.createElement('li')
            const details = document.createElement('div')
            details.innerText = translations[getLanguage()]['histError']
            li.appendChild(details)
            history.appendChild(li)
        }
    }

    function createEntry(game) {
        const history = document.getElementById("users-history-list")
        const li = document.createElement('li')
        const details = document.createElement('div')
        details.classList.add('users-game-details')
        const result = document.createElement('span')
        game.is_winner ? result.innerText = translations[getLanguage()]['win'] : result.innerText = translations[getLanguage()]['loss']
        const opponent = document.createElement('span')
        game.tournament_name == "" ? opponent.innerText = " vs " + game.opponent_name :
            opponent.innerText = " vs " + game.opponent_name + "(" + game.tournament_name + ")"
        const score = document.createElement('span')
        score.innerText = game.score_own + " - " + game.score_opponent
        details.appendChild(result)
        details.appendChild(opponent)
        details.appendChild(score)
        li.appendChild(details)
        history.appendChild(li)
    }

    function deleteStatsEvents() {
        closeBtn.removeEventListener('click', closeStats)
    }
    
    closeBtn.addEventListener('click', closeStats)
}
