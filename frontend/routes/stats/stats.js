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
        } else {
            setStatsValues(null)
        }
    }
 
    //check if user exist with HEAD request
    async function searchUser (user) {
        const isTokenValid = await checkToken()
        
        if (!isTokenValid) return
        console.log("searchUser() of stats.js called!")

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
