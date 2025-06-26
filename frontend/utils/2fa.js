import { checkToken, deleteTokenReload } from "./token.js"
import { getUserToken } from "./userData.js"
import { verify_twofa } from "./login.js"

let otpCodeModal = null
let qrModal = null

const qrNext = document.getElementById('qr-next')
const otpform = document.getElementById('otp-form')
const otpSumbit = document.getElementById('otp-submit')

//QR

export async function showQrModal () {
    const modalElement = document.getElementById('qr-Modal')
    let qrImageUrl

    if (qrModal) {
        qrModal.dispose();
    }
    qrModal = new bootstrap.Modal(modalElement)
    qrModal.show()

    
    //send request for QR, if ok show the img, otherwise show error msg
    const isTokenValid = await checkToken()
    if (!isTokenValid) {
    console.log("token not valid")
    return
    }

    const response = await fetch(`http://${window.location.host}/api/users/setup_2fa/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
    });
    if (response.status == 401) deleteTokenReload()
    if (response.ok) {
        const data = await response.json()
        qrImageUrl = data.qr_code
    } else {
        const message = document.getElementById("qr-message")
        message.innerHTML = `<p class='text-danger'>${translations[getLanguage()]['qrError']}</p>`
    }
    
    //show QR img
    const qrContainer = modalElement.querySelector('#qr-image-container')
    if (qrContainer) {
       qrContainer.innerHTML = `<img src="data:image/png;base64,${qrImageUrl}" alt="QR Code" class="img-fluid" />`
    }
}

export function hideQrModal () {
    if (qrModal) qrModal.hide()
}

qrNext.addEventListener('click', () => {
    hideQrModal()
    showOtpModal()
})

//OTP

export function showOtpModal () {
    const modalElement = document.getElementById('otp-Modal')

    if (otpCodeModal) {
        otpCodeModal.dispose();
    }

    otpCodeModal = new bootstrap.Modal(modalElement)
    otpCodeModal.show()

    const inputs = modalElement.querySelectorAll('.code-control')
    
    //go to next input after insert, allows only number, cancel enabled
    inputs.forEach((input, index) => { 
        input.addEventListener('input', () => {
            input.value = input.value.replace(/\D/, '')
            if (input.value && index < inputs.length - 1) {
                inputs[index + 1].focus()
            }
        })

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value === '' && index > 0) {
                inputs[index - 1].focus()
            }
        })
    })
}

export function hideOtpModal () {
    if (otpCodeModal) {
        document.getElementById('otp-message').innerHTML = ''
        document.getElementById("otp-form").reset()
        otpCodeModal.hide()
    }
}

otpSumbit.addEventListener('click', () => {
    otpform.requestSubmit()
})

otpform.onsubmit = async (e) => {
    e.preventDefault()
    let otpcode = ''

    const inputs = document.querySelectorAll('.code-control')
    inputs.forEach(input => {
        otpcode += input.value
    })

    let partial_token = localStorage.getItem("partial_token")
    if (partial_token) {
        verify_twofa(otpcode)
    } else  {
        setup_twofa(otpcode)
    }
}



async function setup_twofa (otpcode) {
    const isTokenValid = await checkToken()
    if (!isTokenValid) {
        console.log("token not valid")
        return
    }
    const message = document.getElementById("otp-message")
    const response = await fetch(`http://${window.location.host}/api/users/setup_2fa/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
        body: JSON.stringify({otp_code: otpcode}),
    });
    if (response.status == 401) deleteTokenReload()
    if (response.ok) {
            message.innerHTML = `<p class='text-success'>${translations[getLanguage()]['tfaSucc']}</p>`
            setTimeout( () => {
                otpCodeModal.hide()
            }, 2000)
    } else {

        message.innerHTML = `<p class='text-danger'>${translations[getLanguage()]['tfaError']}</p>`
    }
}
