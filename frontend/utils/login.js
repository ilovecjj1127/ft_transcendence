import { hideOtpModal, showOtpModal } from "./2fa.js"
import { showLoginModal, hideLoginModal } from "./modals.js"
import { createMenuProfile } from "./profile-toggle.js"
import { saveUserInfo, setUserToken, getLanguage} from "./userData.js"
import { populateFriendList } from "../social/chat.js"
import { populateRequestList } from "../social/chat-menu.js"
import { onLogin } from "./onload.js"
import { translations } from "../multilang/dictionary.js"

let loginResolver

export function handleLogin() {

    return new Promise((resolve) => {
        loginResolver = resolve
        showLoginModal()
    })
}


export async function loginFunction (password, username) {
    const message = document.getElementById("login-message")
            
    message.innerHTML = ""
            
    const response = await fetch(`http://${window.location.host}/api/users/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });
    if (response.status == 202) { //with 2fa
        const data = await response.json()
        localStorage.setItem("partial_token", data.partial_token)
        hideLoginModal()
        showOtpModal()
    } else if (response.status == 200) { //without 2fa
        const data = await response.json()
        setUserToken(data.access, data.refresh)
        onLogin()
        message.innerHTML = `<p class='text-success'>${translations[getLanguage()]['loginSucc']}</p>`
                
        setTimeout( () => {
            hideLoginModal()
        }, 2000)

        if (typeof loginResolver == 'function') {
            loginResolver(true)
            loginResolver = null
        }
    } else {
        message.innerHTML = `<p class='text-danger'>${translations[getLanguage()]['loginError']}</p>`
        
        setTimeout( () => {
            hideLoginModal()
        }, 2000)
        
        if (typeof loginResolver == 'function') {
            loginResolver(false)
            loginResolver = null
        }

    }
}


export async function verify_twofa (otpcode) {
    const message = document.getElementById("otp-message")
    message.innerHTML = ""
    let partialToken = localStorage.getItem("partial_token")
    const response = await fetch(`http://${window.location.host}/api/users/verify_2fa/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",  
        },
        body: JSON.stringify({
            partial_token: partialToken,
            otp_code: otpcode,
        }),
    });
    if (response.status == 401) deleteTokenReload()
    if (response.ok) {
        const data = await response.json()
        setUserToken(data.access, data.refresh)
        await saveUserInfo()
        createMenuProfile()
        populateFriendList()
        populateRequestList("received-tab")
        
        message.innerHTML = `<p class='text-success'>${translations[getLanguage()]['loginSucc']}</p>`
        
        setTimeout( () => {
            hideOtpModal()
        }, 2000)

        if (typeof loginResolver == 'function') {
            loginResolver(true)
            loginResolver = null
        }
    } else {
        message.innerHTML = `<p class='text-danger'>${translations[getLanguage()]['loginError2']}</p>`
        
        setTimeout( () => {
            hideOtpModal()
        }, 2000)
        
        if (typeof loginResolver == 'function') {
            loginResolver(false)
            loginResolver = null
        }
    }
}