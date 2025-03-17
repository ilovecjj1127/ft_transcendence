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

