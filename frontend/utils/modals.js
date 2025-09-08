import { handleLogin, loginFunction } from "./login.js"
import { getLanguage } from "./userData.js"
import { translations } from "../multilang/dictionary.js"

const loginModal = new bootstrap.Modal('#staticBackdrop')
const registerModal = new bootstrap.Modal(document.getElementById('registerModal'))
const loginForm = document.getElementById("login-form")
const loginButton = document.getElementById("login")
const registerButton = document.getElementById("register-button")
const registerForm = document.getElementById("register-form")
const registerSubmit = document.getElementById("register-submit")

//LOGIN

export function showLoginModal () {
    loginModal.show()
}

export function hideLoginModal () {
    document.getElementById('login-message').innerHTML = ''
    document.getElementById("login-form").reset()
    loginModal.hide()
}

loginForm.onsubmit = async (e) => {
    e.preventDefault()
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    
    loginFunction(password, username)
};

loginButton.addEventListener('click', () => {
    loginForm.requestSubmit()
})

//REGISTRATION

registerForm.onsubmit = async (e) => {
    e.preventDefault()
    const username = document.getElementById("register-username").value
    const password = document.getElementById("register-password").value
    const confirmPassword = document.getElementById("confirm-password").value
    const message = document.getElementById("register-message")

    message.innerHTML = ""
    
    if (password != confirmPassword) {

        message.innerHTML = `<p class='text-danger'>${translations[getLanguage()]['passDiff']}</p>`
        password.value = ""
        confirmPassword.value = ""
        return
    }

    const response = await fetch(`http://${window.location.host}/api/users/register/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const data = await response.json()
        message.innerHTML = `<p class='text-success'>${translations[getLanguage()]['regSucc']}</p>`
                
        setTimeout( () => {
            registerModal.hide()
            handleLogin()
        }, 2000)
    } else {
        const errorData = await response.json();
        message.innerHTML = `<p class='text-danger'>Error: ${errorData.message || translations[getLanguage()]['regError']}</p>`;
    }
}

registerButton.addEventListener('click', function () {
    // Close the Login modal
    hideLoginModal()
    // Show the Register modal
    registerModal.show()
});

registerSubmit.addEventListener("click", function () {
    registerForm.requestSubmit()
})