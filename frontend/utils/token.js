import { getUserToken, removeUserData, setUserToken } from "./userData.js"

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
    if (!token)
        return  true
    const expirationDate = getExpirationDate(token)
    const currentDate = new Date()
    if (currentDate > expirationDate){
        alert("token is expired")
        return true         
    }
    return false
}

export function deleteTokenReload () {
    localStorage.clear()
    window.location.href ='/'
}

async function refreshAccessToken () {
    const refreshToken = getUserToken().refresh

    const response = await fetch(`http://localhost:8000/api/users/token_refresh/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({refresh: refreshToken}), 
    });
    if (response.ok) {
        const data = await response.json()
        setUserToken(data.access, data.refresh)
		return true
    } else {
        deleteTokenReload()
		return false
    }
}

//check if access token is valid, if not check refresh token, if valid refresh token
//if not valid delete data and reload page
export async function checkToken () {
    const token = getUserToken().access
    if (token) {
        if (isTokenExpired(token)){	
            if(isTokenExpired(getUserToken().refresh)){
                deleteTokenReload()
                return false
            }
            return (await refreshAccessToken())
        }
        return true
    }
    return false
}