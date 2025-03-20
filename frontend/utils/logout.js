import {deleteTokenReload, checkToken } from "./token.js"
import { getUserToken, removeUserData } from "./userData.js"

export async function handleLogout (e) {
    e.preventDefault()
    
    const isTokenValid = await checkToken()
    if (!isTokenValid) return
    
    const refreshToken = getUserToken().refresh
    const accessToken = getUserToken().access

    const response = await fetch(`http://${window.location.host}/api/users/logout/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({refresh: refreshToken}),
    });
    
    if (response.ok) {
        const data = await response.json() //maybe remove this
        localStorage.clear()
        alert("Succesfully logged out")
        setTimeout( () => {
            window.location.href ='/'
        }, 1000)
    } else {
        alert("Logout failed, you will get logged out automatically")
        deleteTokenReload()
    }
}