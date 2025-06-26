import { getUserToken, getUserAvatar, getUsername, getLanguage } from "../../utils/userData.js"
import { checkToken, deleteTokenReload } from "../../utils/token.js"
import { translations } from "../../multilang/dictionary.js"

export const init = () => {
    const username = document.getElementById('stats-username')
    const profileImg = document.getElementById('stats-img')
    const searchInput = document.getElementById('search-user')
    const searchError = document.getElementById('search-error')
    const closeBtn = document.getElementById('stats-close-button')
    closeBtn.innerHTML = `<i class='bx bx-x-circle'></i>`
    
    getUserStats()
    getUserHistory()
    if (getUserAvatar())
        profileImg.src = getUserAvatar()

    if (getUsername())
        username.innerText = getUsername()
    
    function handleSearch (e) {
        if (e.key == 'Enter' && searchInput.value) {
            e.preventDefault()
            searchUser(searchInput.value)
            searchInput.value = ''
        }
    }

    function closeStats () {
        deleteStatsEvents()
        location.hash = '/'
    }
    
    //get user stats and save it in stats variable
    async function getUserStats () {
        const isTokenValid = await checkToken()
        
        if (!isTokenValid) return
        
        const statsRequest = await fetch(`http://${window.location.host}/api/games/statistics`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getUserToken().access}`
            },
        });
        if (statsRequest.status == 401) deleteTokenReload()
        if (statsRequest.ok)
        {
            const stats = await statsRequest.json()
            setStatsValues(stats)

            

        } else {
            setStatsValues(null)
        }
    }

    async function getUserHistory() {
        const isTokenValid = await checkToken()
        const user = getUsername()
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
            const history = document.getElementById("stats-history-list")
            const li = document.createElement('li')
            const details = document.createElement('div')
            details.innerText = translations[getLanguage()]['histError']
            li.appendChild(details)
            history.appendChild(li)
        }
    }

    function createEntry(game) {
        const history = document.getElementById("stats-history-list")
        const li = document.createElement('li')
        const details = document.createElement('div')
        details.classList.add('stats-game-details')
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
    
    //check if user exist with HEAD request
    async function searchUser (user) {
        const isTokenValid = await checkToken()
        
        if (!isTokenValid) return
        
        const checkUserExist = await fetch(`http://${window.location.host}/api/users/?username=${user}`, {
            method: "HEAD",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getUserToken().access}`
            },
        });
        if (checkUserExist.status == 401) deleteTokenReload()
        if (checkUserExist.ok)
        {
            deleteStatsEvents()
            localStorage.setItem("userSearched", user)
            location.hash = '/users'
        } else {
            searchError.style.display = 'block'
            setTimeout( () => {
                searchError.style.display = 'none'
            }, 3000)
        }
    }
            
    function deleteStatsEvents() {
        closeBtn.removeEventListener('click', closeStats)
        searchInput.removeEventListener('keydown', handleSearch)
    }
    
    function setStatsValues (stats) {
        if (stats){
            document.getElementById('total-games').textContent = stats.total_games
            document.getElementById('won-games').textContent = stats.games_won
            document.getElementById('lost-games').textContent = stats.games_lost
            document.getElementById('win-rate').textContent = stats.win_percentage
            document.getElementById('avg-points').textContent = stats.avgerage_points_per_game
        } else {
            document.getElementById('total-games').textContent =  translations[getLanguage()]['uknown']
            document.getElementById('won-games').textContent = translations[getLanguage()]['uknown']
            document.getElementById('lost-games').textContent = translations[getLanguage()]['uknown']
            document.getElementById('win-rate').textContent = translations[getLanguage()]['uknown']
            document.getElementById('avg-points').textContent = translations[getLanguage()]['uknown']
        }
    }

    searchInput.addEventListener('keydown', handleSearch)
    closeBtn.addEventListener('click', closeStats)
}
