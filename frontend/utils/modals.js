import { createMenuProfile } from "./profile-toggle.js"
import { saveUserInfo, setUserToken } from "./userData.js"

const loginModal = new bootstrap.Modal('#staticBackdrop')
const registerModal = new bootstrap.Modal(document.getElementById('registerModal'))
const loginForm = document.getElementById("login-form")
const loginButton = document.getElementById("login")
const registerButton = document.getElementById("register-button")
const registerForm = document.getElementById("register-form")
const registerSubmit = document.getElementById("register-submit")

export function showLoginModal () {
    loginModal.show()
}

export function hideLoginModal () {
    loginModal.hide()
    createMenuProfile()
}

//forms to fill

loginForm.onsubmit = async (e) => {
    e.preventDefault()
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const message = document.getElementById("login-message")
            
    message.innerHTML = ""
            
    const response = await fetch(`http://${window.location.host}/api/users/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const data = await response.json()
        setUserToken(data.access, data.refresh)
        saveUserInfo()
        message.innerHTML = "<p class='text-success'>Login successful! Access token saved.</p>"
                
        setTimeout( () => {
            hideLoginModal()
        }, 2000)
        document.getElementById("social-menu-container").style.display = "flex"
        window.location.reload();
            
    } else {
        message.innerHTML = "<p class='text-danger'>Login failed. Check your credentials.</p>"
    }
};

registerForm.onsubmit = async (e) => {
    e.preventDefault()
    const username = document.getElementById("register-username").value
    const password = document.getElementById("register-password").value
    const confirmPassword = document.getElementById("confirm-password").value
    const message = document.getElementById("register-message")

    message.innerHTML = ""
    
    if (password != confirmPassword) {

        message.innerHTML = "<p class='text-danger'>The passwords differ.</p>"
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
        message.innerHTML = "<p class='text-success'>Registered successful! Now you can login.</p>"
                
        setTimeout( () => {
            registerModal.hide()
            showLoginModal()
        }, 2000)
    } else {
        const errorData = await response.json();
        message.innerHTML = `<p class='text-danger'>Error: ${errorData.message || "An error occurred. Please try again."}</p>`;
    }
}

//button events listener

loginButton.addEventListener('click', () => {
    loginForm.requestSubmit()
})

registerButton.addEventListener('click', function () {
    // Close the Login modal
    hideLoginModal()
    // Show the Register modal
    registerModal.show();
});

registerSubmit.addEventListener("click", function () {
    registerForm.requestSubmit()
})