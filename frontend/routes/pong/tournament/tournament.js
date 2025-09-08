import { createNotLoggedMessage, createBackToMenu, createRefresh } from "../../../utils/canvas-utils.js"
import { checkToken, deleteTokenReload } from "../../../utils/token.js"
import { getUserToken, getLanguage } from "../../../utils/userData.js"
import { createOnGoingTour } from "./list-creation/ongoingTournament.js"
import { createOpenRegistration } from "./list-creation/openRegistration.js"
import { createUpcomingGames } from "./list-creation/upcomingGames.js"
import { createUpcomingTour } from "./list-creation/upcomingTournament.js"
import { translations } from "../../../multilang/dictionary.js";


export const init = () => {
    const overlay = document.querySelector('.overlay')
    const canvas = document.getElementById('gameCanvas')
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    ctx.clearRect( 0,0, canvas.width, canvas.height)

    createBackToMenu(overlay, '/pong')
    if (getUserToken().access){
        createTourMenu(overlay)
        createRefresh(overlay)
    } else {
        createNotLoggedMessage(overlay)
    }
}

function createTourMenu (overlay) {
    const menu = document.createElement('div')
    menu.id = 'tour-menu'
    
    const topBtnContainer = document.createElement('div')
    topBtnContainer.id = "top-btn-container"
    const dropDownContainer = document.createElement('div')
    dropDownContainer.id = ('dropdown-container')
    
    //top buttons
    createNewTourButton(topBtnContainer)
    
    //lists
    createOpenRegistration(dropDownContainer)
    createUpcomingGames(dropDownContainer)
    createOnGoingTour(dropDownContainer)
    createUpcomingTour(dropDownContainer)
    
    menu.appendChild(topBtnContainer)
    menu.appendChild(dropDownContainer)
    overlay.appendChild(menu)
}

function createNewTourButton (container) {
    const newTour = document.createElement('button')
    newTour.id = 'new-tour'
    newTour.innerText = translations[getLanguage()]['createTour']
    container.appendChild(newTour)
    
    newTour.addEventListener("click", async function () {
        //create modal to insert the info for tournament
        const formData = await createNewTourModal()
        if (formData) {
            const isTokenValid = await checkToken()
            if (!isTokenValid) return
        
            const response = await fetch(`http://${window.location.host}/api/tournament/create/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getUserToken().access}`
                },
                body: JSON.stringify({
                    name: formData["tour-name"],
                    min_players: formData["min"],
                    max_players: formData["max"],
                    winning_score: formData["score"],
                    alias: formData["alias"],
                }),
            });
            if (response.status == 401) deleteTokenReload()
            if (response.ok) {
                const data = await response.json()
                responseCheck("Tournament created.\n" + formData["tour-name"] + " starting soon.")
                return true
            } else {
                responseCheck("Error creating the tournament.\n Try again")
                return false
            }
        }
    })
}

async function createNewTourModal() {
    return new Promise((resolve) => {
        const overlay = document.querySelector('.overlay')
        const newTourModal = document.createElement('div')
        newTourModal.id = 'tour-modal'
        const form = document.createElement('form')
        form.id = 'tour-form'

        const fields = [
            { label: translations[getLanguage()]['yourAlias'], id: "alias", type: "text", required: true },
            { label: translations[getLanguage()]['tourName'], id: "tour-name", type: "text", required: true },
            { label: translations[getLanguage()]['minPlayer'], id: "min", type: "text", required: true },
            { label: translations[getLanguage()]['maxPlayer'], id: "max", type: "text", required: true },
            { label: translations[getLanguage()]['winScore'], id: "score", type: "text", required: true },
        ];

        const inputs = {}

        fields.forEach(field => {
            const label = document.createElement('label')
            label.innerText = field.label
            const input = document.createElement('input')
            input.type = field.type
            input.id = field.id
            if (field.required) input.required = true

            inputs[field.id] = input

            form.appendChild(label)
            form.appendChild(input)
        });

        const createTourBtn = document.createElement('button')
        createTourBtn.type = 'submit'
        createTourBtn.innerText = translations[getLanguage()]['createTour']

        const cancelTourBtn = document.createElement('button')
        cancelTourBtn.type = 'button'
        cancelTourBtn.innerText = translations[getLanguage()]['cancel']
        cancelTourBtn.addEventListener('click', () => {
            newTourModal.remove()
            resolve(null)
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault()
            const formData = {};
            Object.keys(inputs).forEach(key => {
                if (!validateInput(key, inputs[key].value))
                {
                    responseCheck("Input values not allowed. \n Tournament not created")
                    resolve(null)
                }
                formData[key] = inputs[key].value
            })

            resolve(formData)
            newTourModal.remove()
        });

        const formBtnContainer = document.createElement('div')
        formBtnContainer.id = "tour-form-btn-container"

        formBtnContainer.appendChild(createTourBtn)
        formBtnContainer.appendChild(cancelTourBtn)
        form.appendChild(formBtnContainer)
        newTourModal.appendChild(form)
        overlay.appendChild(newTourModal)
    });
}

function validateInput(key, value) {
    if (key == "min") {
        if (!value || value > 9 || value < 3) return false
    } else if (key == "max") {
        if (!value || value < 4 || value > 10) return false
    } else if (key == 'score') {
        if (!value || value < 1 || value > 20) return false
    }
    return true
}

    function responseCheck(message) {
        const overlay = document.querySelector('.overlay')
        const responseContainer = document.createElement('div')
        responseContainer.id = 'response-container'

        const responseMessage = document.createElement('p')
        responseMessage.innerText = message

        const okButton = document.createElement('button')
        okButton.id = 'response-ok'
        okButton.innerText = 'Ok'
        okButton.addEventListener('click', () => {
            responseContainer.remove()
        })
        responseContainer.appendChild(responseMessage)
        responseContainer.appendChild(okButton)
        overlay.appendChild(responseContainer)
    }