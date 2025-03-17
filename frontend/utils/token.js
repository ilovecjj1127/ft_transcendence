function decodeJWT(token) {
    const parts = token.split('.')
    const payload = parts[1]
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const payloadObj = JSON.parse(decodedPayload)

    return payloadObj
}

function getExpirationDate(token) {
    const decoded = decodeJWT(token)
    const expTimestamp = decoded.exp
    const expirationDate = new Date(expTimestamp * 1000)
    
    return expirationDate
}

export function isTokenExpired(token)
{
    const expirationDate = getExpirationDate(token)
    const currentDate = new Date()
    if (currentDate > expirationDate){
        alert("token is expired")
        return true         
    }
    alert("token not expired")
    return false
}

export function deleteTokenReload () {
	alert("deleting token and reload ")
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.reload()
}

async function refreshAccessToken () {
    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken){
		alert("no refresh token")
        return false
	}

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
		alert("token refreshed correctly")
		return true
    } else {
		alert("refresh token not valid")
        deleteTokenReload()
		return false
    }
}

export async function checkToken () {
    const token = localStorage.getItem('access_token')
    alert("checking token")
    if (token)
    {
        if (isTokenExpired(token)){	
            alert("refreshing token")
            return (await refreshAccessToken())	
        }
        return true
    }
    return false
}