import { getUserToken, getUserAvatar, getUsername } from "../../utils/userData.js"
import { checkToken, deleteTokenReload } from "../../utils/token.js"

export const init = () => {
    const username = document.getElementById('stats-username')
    const profileImg = document.getElementById('stats-img')
    const searchInput = document.getElementById('search-user')
    const searchError = document.getElementById('search-error')
    const closeBtn = document.getElementById('stats-close-button')
    closeBtn.innerHTML = `<i class='bx bx-x-circle'></i>`
    
    getUserStats()
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

            //to move with an api call function
            
            const games = [
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"bob", score1: 1, score2: 3},
    {result: "loss", opponent:"alice", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "loss", opponent:"David", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "loss", opponent:"alice", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "loss", opponent:"bob", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
    {result: "win", opponent:"Lisa", score1: 1, score2: 3},
]

            function populateHistoryList() {
                const history = document.getElementById("stats-history-list")
                
                games.forEach(game => {
                    const li = document.createElement('li')
                    const details = document.createElement('div')
                    details.classList.add('stats-game-details')
                    const result = document.createElement('span')
                    result.innerText = game.result.toUpperCase()
                    const opponent = document.createElement('span')
                    opponent.innerText = " vs " + game.opponent
                    const score = document.createElement('span')
                    score.innerText = game.score1 + " - " + game.score2
                    details.appendChild(result)
                    details.appendChild(opponent)
                    details.appendChild(score)
                    li.appendChild(details)
                    history.appendChild(li)
                })
            }

            populateHistoryList()


        } else {
            setStatsValues(null)
        }
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
            document.getElementById('total-games').textContent = "unknown"
            document.getElementById('won-games').textContent = "unknown"
            document.getElementById('lost-games').textContent = "unknown"
            document.getElementById('win-rate').textContent = "unknown"
            document.getElementById('avg-points').textContent = "unknown"
        }
    }

    searchInput.addEventListener('keydown', handleSearch)
    closeBtn.addEventListener('click', closeStats)
}
