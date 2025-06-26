import { getUserToken, getUserAvatar, getUsername, getLanguage } from "../../utils/userData.js"
import { checkToken, deleteTokenReload } from "../../utils/token.js"
import { showQrModal } from "../../utils/2fa.js" 
import { translations } from "../../multilang/dictionary.js"

export const init = () => {
    
    const form = document.getElementById('password-change')
    const username = document.getElementById('settings-username')
    const profileImg = document.getElementById('settings-img')
    const confirm = document.getElementById('confirm')
    const imgUpload = document.getElementById('image-upload')
    const uploadError = document.getElementById('upload-error')
    const closeBtn = document.getElementById('close-button')
    const twofaButton = document.getElementById('twofa-button')
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
            changeAvatar(file).then((ok) => {
                if (ok) {

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
            })
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
        if (response.status == 401) deleteTokenReload()
        if (response.ok) {
            console.log("uploaded correctly")
            return true
        } else {
            console.log("failed to upload avatar")
            uploadError.style.display = 'block'
            setTimeout( () => {
                uploadError.style.display = 'none'
            }, 3000)
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
            message.innerHTML = `<p class='text-danger'>${translations[getLanguage()]['pwdMatch']}</p>`
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
            if (response.status == 401) deleteTokenReload()
            if (response.ok) {
                message.innerHTML = `<p class='text-success'>${translations[getLanguage()]['pwdChange']}</p>`
                clearInputs()
            } else {
                const errorData = await response.json()
                const errorMessage = errorData.new_password || translations[getLanguage()]['pwdError']
                message.innerHTML = `<p class='text-danger'>${errorMessage}</p>`
                clearInputs()
            }
        }
    }

    twofaButton.addEventListener('click', () => {
        console.log("button clicked")
        showQrModal()
    })
    
    imgUpload.addEventListener('change', changeProfileImg)
    profileImg.addEventListener('click', triggerChangeImg)
    confirm.addEventListener('click', submitForm)
    closeBtn.addEventListener('click', closeSettings)
}
