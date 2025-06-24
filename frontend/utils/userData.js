import { checkToken, deleteTokenReload } from "./token.js";

export async function saveUserInfo () {
    const isTokenValid = await checkToken()
    if (!isTokenValid) return

    const response = await fetch(`http://${window.location.host}/api/users/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
    });
    if (response.status == 401) deleteTokenReload()
    if (response.ok) {
        const userData = await response.json()
        localStorage.setItem("id", userData.id)
        localStorage.setItem("username", userData.username)
        localStorage.setItem("avatar", userData.avatar)
        localStorage.setItem("friends", JSON.stringify(userData.friends))
        localStorage.setItem("received", JSON.stringify(userData.received_requests))
        localStorage.setItem("sent", JSON.stringify(userData.sent_requests))
        setTimeout( () => {}, 2000)
        document.getElementById('profile-img').src = userData.avatar 
        return true
    } else {
        console.log("error saving user info")
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

export function getUsername () {
    return (localStorage.getItem("username"))
}

export function getUserId () {
    return (localStorage.getItem("id"))
}

export function getFriends () {
    return (localStorage.getItem("friends"))
}

export function getLanguage () {
    let lang = localStorage.getItem('appLanguage') || 'en'
    return lang
}