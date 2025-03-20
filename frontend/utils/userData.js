export async function saveUserInfo (access) {
    console.log("saving user info")
    const response = await fetch(`http://${window.location.host}/api/users/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access}`
        },
    });
    if (response.ok) {
        const userData = await response.json()
        localStorage.setItem("username", userData.username)
        localStorage.setItem("avatar", userData.avatar)
        localStorage.setItem("friends", userData.friends)
        return true
    } else {
        alert("error saving user info")
        return false
    }
}
 
export function removeUserData() {
    localStorage.removeItem("username")
    localStorage.removeItem("avatar")
    localStorage.removeItem("friends")
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
}

export function setUserToken (access, refresh) {
    localStorage.setItem("accessToken", access)
    localStorage.setItem("refreshToken", refresh)
}

export function getUserToken () {
    const access_token = localStorage.getItem("accessToken")
    const refresh_token = localStorage.getItem("refreshToken")

    return {access: access_token, refresh: refresh_token}
}

export function getUserAvatar () {
    return (localStorage.getItem("avatar"))
}

export async function setUserAvatar () {
    const response = await fetch(`http://${window.location.host}/api/users/avatar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
    });
    if (response.ok) {
        const userData = await response.json()
        localStorage.setItem("avatar", userData.avatar)
        return true
    } else {
        alert("error uploading avatar")
        return false
    }
}