import { getUserToken } from "../../utils/userData.js"
import { checkToken, deleteTokenReload } from "../../utils/token.js"

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
            // username.innerText = userSearched.username
            profileImg.src = userSearched.avatar

            
            function populateHistoryList() {
                const history = document.getElementById("users-history-list")
                
                games.forEach(game => {
                    const li = document.createElement('li')
                    const details = document.createElement('div')
                    details.classList.add('users-game-details')
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
            console.log("user search error")
        }
    }
            
    function deleteStatsEvents() {
        closeBtn.removeEventListener('click', closeStats)
    }
    
    closeBtn.addEventListener('click', closeStats)
}

