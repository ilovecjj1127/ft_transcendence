import { getUserToken, getUserAvatar, getUsername } from "../../utils/userData.js"
import { checkToken } from "../../utils/token.js"


export const init = () => {
    
    const form = document.getElementById('password-change')
    const username = document.getElementById('settings-username')
    const profileImg = document.getElementById('settings-img')
    
    if (getUserAvatar())
        profileImg.src = getUserAvatar()
    if (getUsername())
        username.innerText = getUsername()
    const closeBtn = document.getElementById('close-button')
    closeBtn.innerHTML = `<i class='bx bx-x-circle'></i>`
    closeBtn.addEventListener('click', () => {
        location.hash = '/'
    })
    const confirm = document.getElementById('confirm')
    confirm.addEventListener('click', () => {
        form.requestSubmit()
    })
    
    form.onsubmit = async (e) => {
        e.preventDefault()
    
        const oldPassword = document.getElementById('old-password').value
        const newPassword = document.getElementById('new-password').value
        const confirmPassword = document.getElementById('confirm-password-change').value
        const message = document.getElementById('change-message')
        
        message.innerHTML = ''
    
        if (newPassword != confirmPassword){
            message.innerHTML = "<p class='text-danger'>Failed. New password do not match.</p>"
            clearInputs()
        }
        else {
                const isTokenValid = await checkToken()
                if (!isTokenValid) return
            console.log(oldPassword, newPassword)
                const response = await fetch(`http://${window.location.host}/api/users/password_change/`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${getUserToken().access}`
                    },
                    body: JSON.stringify({ oldPassword, newPassword }),
                });
            
                if (response.ok) {
                    message.innerHTML = "<p class='text-success'>Password changed.</p>"
                } else {
                    const errorData = await response.json()
                    console.log("error message", errorData.new_password)
                    // const errorMessage = errorData.detail || "Password change failed. Please check your credentials."
                    // message.innerHTML = `<p class='text-danger'>${errorMessage}</p>`
                    clearInputs()
                }
        }
    
    }
}



function clearInputs () {
    const message = document.getElementById('change-message')

    document.getElementById('old-password').value = ''
    document.getElementById('new-password').value = ''
    document.getElementById('confirm-password-change').value = ''
    setTimeout( () => {
       message.innerHTML = ''
    }, 2000)
}