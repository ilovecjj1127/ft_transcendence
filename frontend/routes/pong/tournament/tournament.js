
import { checkToken } from "../../../utils/token.js"
import { getUserToken } from "../../../utils/userData.js"
import { createOnGoingTour } from "./list-creation/ongoingTournament.js"
import { createOpenRegistration } from "./list-creation/openRegistration.js"
import { createUpcomingGames } from "./list-creation/upcomingGames.js"
import { createUpcomingTour } from "./list-creation/upcomingTournament.js"

export const init = () => {
    const overlay = document.querySelector('.overlay')
    const canvas = document.getElementById('gameCanvas')
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    ctx.clearRect( 0,0, canvas.width, canvas.height)
    createBackToMenu(overlay)
    createTourMenu(overlay)
};

function createBackToMenu (overlay) {
    const backToMenu = document.createElement('div')
    backToMenu.id = 'back-to-menu'
    backToMenu.innerHTML = `<i class='bx bx-arrow-back'></i>`

    overlay.appendChild(backToMenu)
    
    function back () {
        backToMenu.removeEventListener('click', back)
        location.hash = "/pong"
    }

    backToMenu.addEventListener('click', back)
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
    newTour.innerText = 'Create new tournament'
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
            if (response.ok) {
                const data = await response.json()
                return true
            } else {
                alert("error creating tournament")
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
            { label: "Your Alias", id: "alias", type: "text", required: true },
            { label: "Tournament Name", id: "tour-name", type: "text", required: true },
            { label: "Min player (min 3)", id: "min", type: "text", required: true },
            { label: "Max Player (max 10)", id: "max", type: "text", required: true },
            { label: "Win Score (1 - 20)", id: "score", type: "text", required: true },
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
        createTourBtn.innerText = 'Create'

        const cancelTourBtn = document.createElement('button')
        cancelTourBtn.type = 'button'
        cancelTourBtn.innerText = 'Cancel'
        cancelTourBtn.addEventListener('click', () => {
            newTourModal.remove()
            resolve(null)
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault()
            const formData = {};
            Object.keys(inputs).forEach(key => {
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