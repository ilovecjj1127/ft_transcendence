import { isTokenExpired } from "./check-token.js"

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

// export function checkToken () {
//     const token = localStorage.getItem('access_token')
//     if (!token){
//         alert ("User is not logged in")
// 		deleteTokenReload()
//         return false
//     }
//     if (isTokenExpired(token)) {
// 		alert ("refreshing token")
//         const ret = refreshAccessToken()
// 		return ret
// 	}
//     return true
// }

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