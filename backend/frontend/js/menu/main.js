import { drawMenu, getMenu} from "./select-menu.js"
import { createMenuProfile} from "../profile/profile.js"

export function getCanvasContent () {
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d")
    const backToMenu = document.getElementById("back-to-menu")
    return {ctx : ctx, canvas : canvas, backToMenu : backToMenu}
}

const loginModal = new bootstrap.Modal('#staticBackdrop')

export function showLoginModal () {
    loginModal.show()
}

export function hideLoginModal () {
    loginModal.hide()
    createMenuProfile()
}

//manage what happens on page load
window.onload = function () {
    const accessToken = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")
    if (!accessToken ) { //|| checkIfBackendKnowsUser()
        console.log("Access token not found")
        showLoginModal()
    } //testing purpose to be removed
    else {
        console.log("Access token found:" + accessToken)
    }
    if (!checkIfBackendSaysAccessTokenOk(`http://${window.location.host}/api/users/me/`, accessToken))
    {
        showLoginModal()
    }
    if (!refreshToken) {
        console.log("Refresh token not found")
    }
    else {
        console.log("Refresh token found:" + refreshToken)
    }
    createMenuProfile()
    if (getMenu())
        drawMenu()
}

async function checkIfBackendSaysAccessTokenOk(url, accessToken)
{
    console.log("Hi")

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
    });
    console.log("GET: api/users/me, status: ", response.status)
    const data = await response.json()
    console.log("data: ", response.data)
	if (response.ok) {
        return true;
    } else {
        return false;
    }
}
