import { getUserToken, getUserAvatar, getUsername } from "../../utils/userData.js"
import { checkToken } from "../../utils/token.js"


export const init = () => {
    
    const form = document.getElementById('password-change')
    const username = document.getElementById('settings-username')
    const profileImg = document.getElementById('settings-img')
    const confirm = document.getElementById('confirm')
    const imgUpload = document.getElementById('image-upload')
    const closeBtn = document.getElementById('close-button')
    closeBtn.innerHTML = `<i class='bx bx-x-circle'></i>`
    
    if (getUserAvatar())
        profileImg.src = getUserAvatar()
    
    if (getUsername())
        username.innerText = getUsername()
    
    function closeSettings () {
        deleteEvents()
        location.hash = '/'
    }
    
    function triggerChangeImg() {
        imgUpload.click()
    }

    function changeProfileImg(event) {
        const file = event.target.files[0];
        if (file) {

            //change avatar API
            if (changeAvatar(file)) {
                //change profile img
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageUrl = e.target.result;
                    localStorage.setItem("avatar", imageUrl)
                    profileImg.src = imageUrl;
                    document.getElementById('profile-img').src = imageUrl
                };
                reader.readAsDataURL(file);
            }
        }
    }

    async function changeAvatar (file) {
        const formData = new FormData()
        formData.append('avatar', file)

        const isTokenValid = await checkToken()
        if (!isTokenValid) return
        const response = await fetch(`http://${window.location.host}/api/users/avatar/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${getUserToken().access}`
            },
            body: formData,
        });
        
        if (response.ok) {
            console.log("uploaded correctly")
            return true
        } else {
            console.log("failed to upload avatar")
            return false
        }
    }

    function submitForm () {form.requestSubmit()}
    
    function deleteEvents () {
        confirm.removeEventListener('click', submitForm)
        closeBtn.removeEventListener('click', closeSettings)
        imgUpload.removeEventListener('change', changeAvatar)
        profileImg.removeEventListener('click', triggerChangeImg)
    }
    
    function clearInputs () {
        const message = document.getElementById('change-message')
        
        document.getElementById('old-password').value = ''
        document.getElementById('new-password').value = ''
        document.getElementById('confirm-password-change').value = ''
        setTimeout( () => {
           message.innerHTML = ''
        }, 4000)
    }

    form.onsubmit = async (e) => {
        e.preventDefault()
        
        const old_password = document.getElementById('old-password').value
        const new_password = document.getElementById('new-password').value
        const confirmPassword = document.getElementById('confirm-password-change').value
        const message = document.getElementById('change-message')
        
        message.innerHTML = ''
        
        if (new_password != confirmPassword){
            message.innerHTML = "<p class='text-danger'>Failed. New password do not match.</p>"
            clearInputs()
        }
        else {
            const isTokenValid = await checkToken()
            if (!isTokenValid) return
            const response = await fetch(`http://${window.location.host}/api/users/password_change/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getUserToken().access}`
                },
                body: JSON.stringify({ old_password, new_password }),
            });
            
            if (response.ok) {
                message.innerHTML = "<p class='text-success'>Password changed.</p>"
                clearInputs()
            } else {
                const errorData = await response.json()
                const errorMessage = errorData.new_password || "Password change failed. Please check your credentials."
                message.innerHTML = `<p class='text-danger'>${errorMessage}</p>`
                clearInputs()
            }
        }
    }
    
    imgUpload.addEventListener('change', changeProfileImg)
    profileImg.addEventListener('click', triggerChangeImg)
    confirm.addEventListener('click', submitForm)
    closeBtn.addEventListener('click', closeSettings)
}
