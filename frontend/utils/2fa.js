import { checkToken, deleteTokenReload } from "./token.js"
import { getUserToken, setUserToken, saveUserInfo } from "./userData.js"

let otpCodeModal = null
let qrModal = null

const qrNext = document.getElementById('qr-next')
const otpform = document.getElementById('otp-form')
const otpSumbit = document.getElementById('otp-submit')

export function showOtpModal () {
    const modalElement = document.getElementById('otp-Modal')

    if (otpCodeModal) {
        otpCodeModal.dispose();
    }

    otpCodeModal = new bootstrap.Modal(modalElement)
    otpCodeModal.show()

    const inputs = modalElement.querySelectorAll('.code-control')
    
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
    console.log(response.status)
    if (response.status == 401) deleteTokenReload()
        if (response.ok) {
            const data = await response.json()
            qrImageUrl = data.qr_code
        } else {
        const message = document.getElementById("qr-message")
        message.innerHTML = "<p class='text-danger'>QR code failed to load. Close and try again.</p>"
    }
    
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
    if (partial_token) 
    {
        //verify
        verify_twofa(otpcode)
    } else  {
        //setup
        setup_twofa(otpcode)
    }
    //check if user 2fa enabled
    //if yes do setup if not do verify


}

async function verify_twofa (otpcode) {
    const message = document.getElementById("qr-message")
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
        saveUserInfo()
        message.innerHTML = "<p class='text-success'>Login successful! Access token saved.</p>"
                
        setTimeout( () => {
            otpCodeModal.hide()
        }, 2000)

    } else {

        message.innerHTML = "<p class='text-danger'>QR code failed to load. Close and try again.</p>"
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
            message.innerHTML = "<p class='text-success'>2fa succefully setup.</p>"
            setTimeout( () => {
                otpCodeModal.hide()
            }, 2000)
    } else {

        message.innerHTML = "<p class='text-danger'>2fa failed setup. Close and try again.</p>"
    }
}
