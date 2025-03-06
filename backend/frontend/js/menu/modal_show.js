const myModal = new bootstrap.Modal('#staticBackdrop')

const form = document.getElementById("login-form");
const loginButton = document.getElementById("login")
        

form.onsubmit = async (e) => {
    e.preventDefault();
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
        localStorage.setItem("access_token", data.access)
        localStorage.setItem("refresh_token", data.refresh)
        message.innerHTML = "<p class='text-success'>Login successful! Access token saved.</p>"
                
        setTimeout( () => {
            myModal.hide()
        }, 2000)
    } else {
        message.innerHTML = "<p class='text-danger'>Login failed. Check your credentials.</p>"
    }
};

loginButton.addEventListener('click', () => {
    form.requestSubmit()
})

window.addEventListener('DOMContentLoaded', () => {
    //check for user login or not
    const token = localStorage.getItem("access_token")
    if (!token)
        myModal.show();
})