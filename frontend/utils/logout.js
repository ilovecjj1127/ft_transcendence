import {deleteTokenReload, checkToken } from "./token.js"

export async function handleLogout (e) {
    e.preventDefault()
    
    const isTokenValid = await checkToken()
    if (!isTokenValid) return
    
    const refreshToken = localStorage.getItem('refresh_token')
    const accessToken = localStorage.getItem('access_token')

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
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        alert("Succesfully logged out")
        setTimeout( () => {
            window.location.reload()
        }, 1000)
    } else {
        alert("Logout failed, you will get logged out automatically")
        deleteTokenReload()
    }
}