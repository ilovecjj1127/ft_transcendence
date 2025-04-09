import { getUserToken } from "../../utils/userData.js"
import { checkToken } from "../../utils/token.js"

export const init = () => {
    const username = document.getElementById('users-username')
    const profileImg = document.getElementById('users-img')
    const closeBtn = document.getElementById('users-close-button')
    closeBtn.innerHTML = `<i class='bx bx-x-circle'></i>`
    
    const user = localStorage.getItem("userSearched")
    localStorage.removeItem("userSearched")

    getUserSearched()
    
    function closeStats () {
        deleteStatsEvents()
        location.hash = '/stats'
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
            username.innerText = userSearched.username
            profileImg.src = userSearched.avatar
        } else {
            console.log("user search error")
        }
    }
            
    function deleteStatsEvents() {
        closeBtn.removeEventListener('click', closeStats)
    }
    
    closeBtn.addEventListener('click', closeStats)
}
