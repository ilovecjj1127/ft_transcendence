import { isTokenExpired } from "./check-token.js"

function deleteTokenReload () {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.reload()
}

async function refreshAccessToken () {
    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken)
        return //user should not be logged in

    const response = await fetch(`http://localhost:8000/api/users/token_refresh/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({refresh: refreshToken}), 
    });
    if (response.ok) {
        const data = await response.json()
        localStorage.setItem("access_token", data.access)
        localStorage.setItem("refresh_token", data.refresh)
    } else {
        deleteTokenReload()
    }
}

export function checkToken () {
    const token = localStorage.getItem('access_token')

    if (!token){
        alert ("User is not logged in")
        return false
    }
    if (isTokenExpired(token))
        refreshAccessToken()

    return true
}