
import { checkToken } from "../../../utils/token.js"
import { getUserToken } from "../../../utils/userData.js"

export const init = () => {
    const overlay = document.querySelector('.overlay')
    const canvas = document.getElementById('gameCanvas')
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    ctx.clearRect( 0,0, canvas.width, canvas.height)
    createBackToMenu(overlay)
    createTourMenu(overlay)
    // //extracting parameters on route change
    // const params = new URLSearchParams(location.search)
    // const message = params.get('message')
    console.log("in tournament")
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
    createTopButtons(menu)
    createLists(menu)
    overlay.appendChild(menu)
}

function createTopButtons (menu) {
    const topBtnContainer = document.createElement('div')
    topBtnContainer.id = "top-btn-container"
    createNewTourButton(topBtnContainer)
    createLeaderButton(topBtnContainer)
    menu.appendChild(topBtnContainer)
}

function createNewTourButton (container) {
    const newTour = document.createElement('button')
    newTour.id = 'new-tour'
    newTour.innerText = 'Create new tournament'
    container.appendChild(newTour)
    
    // newTour.addEventListener("click", async function () {
    //     //create modal to insert the info for tournament
        
    //     const isTokenValid = await checkToken()
    //     if (!isTokenValid) return
    
    //     const response = await fetch(`http://${window.location.host}/api/tournament/create/`, {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //             "Authorization": `Bearer ${getUserToken().access}`
    //         },
    //         body: JSON.stringify(),
    //     });
    //     if (response.ok) {
    //         const data = await response.json()
    //         alert("tournament created " + data.game.id)
    //         localStorage.setItem("gameId", data.game.id)
    //         //location.hash = '/pong/onlineplayer/onlinegame'
    //         return true
    //     } else {
    //         alert("error creating tournament")
    //         return false
    //     }
    // })
}

function createLeaderButton (container) {
    const leader = document.createElement('button')
    leader.id = 'leader'
    leader.innerText = 'Leaderboard'
    container.appendChild(leader)

    //change route to leaderboard
}

function createLists (menu) {
    const dropDownContainer = document.createElement('div')
    dropDownContainer.id = ('dropdown-container')
    //function to create list
    createOpenRegistration(dropDownContainer)
    createUpcomingGames(dropDownContainer)
    menu.appendChild(dropDownContainer)
}

//list of joinable tournaments (show/registration)
function createOpenRegistration (container) {
    
    
    const listContainer = document.createElement('div')
    listContainer.classList.add('dropdown')
    const listBtn = document.createElement('button')
    listBtn.classList.add('dropdown-button')
    listBtn.innerText = "Registration open"
    const list = document.createElement('ul')
    list.classList.add('dropdown-list')

    listBtn.addEventListener('click', async () => {
        //request to create the list

        list.innerHTML = ''

        const isTokenValid = await checkToken()
        if (!isTokenValid) return

        const listResponse = await fetch(`http://${window.location.host}/api/tournament/show/registration`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getUserToken().access}`
            },
        });
        if (listResponse.ok) {
            const data = await listResponse.json()
            if (data.length === 0) {
                // Handle the empty case, for example:
                const noTournamentsMessage = document.createElement('p');
                noTournamentsMessage.textContent = "No tournaments available for registration.";
                list.appendChild(noTournamentsMessage);
            } else {
            data.forEach((tour) => {
                const li = document.createElement('li')
                li.textContent = tour.name
                const button = document.createElement('button')
                button.innerText = "Register"
                li.appendChild(button)
                list.appendChild(li)
                
                // button.addEventListener('click', async () => {
                //     //create the modal for info
                //     const alias = joinModal()
                //     if (alias) {
                //         const isTokenValid = await checkToken()
                //         if (!isTokenValid) return
                        
                //         const registrResponse = await fetch(`http://${window.location.host}/api/tournament/show/registration`, {
                //             method: "POST",
                //             headers: {
                //                 "Content-Type": "application/json",
                //                 "Authorization": `Bearer ${getUserToken().access}`
                //             },
                //             body: JSON.stringify({
                //                 tournament_id: tour.id,
                //                 alias: alias 
                //             }),
                //         });
                //         if (registrResponse.ok) {
                //             alert('registered correctly')
                //         } else {
                //             //add error box
                //             alert('error registration')
                //         }
                //     }                    
                // })
            })
        }
        } else {
            const li = document.createElement()
            li.textContent = "Error retrieving Tournament. Try again later"
            list.appendChild(li)
        }
        list.classList.toggle('show')
        if (list.classList.contains('show')) {
            listContainer.style.marginBottom = `${list.offsetHeight + 10}px`; // Move the entire dropdown down
        } else {
            listContainer.style.marginBottom = ''; // Reset the margin when closed
        }
    })
    listContainer.appendChild(list)
    listContainer.appendChild(listBtn)
    container.appendChild(listContainer)
}

//list of next games to play (show/ready/games)
function createUpcomingGames (container) {
    const listContainer = document.createElement('div')
    listContainer.classList.add('dropdown')
    const listBtn = document.createElement('button')
    listBtn.classList.add('dropdown-button')
    listBtn.innerText = "Upcoming Games"
    const list = document.createElement('ul')
    list.classList.add('dropdown-list')

    listBtn.addEventListener('click', () => {
        const elements = [
            {id: 'stats', label: 'Statistics'},
            {id: 'settings', label: 'Settings'},
            {id: 'logout', label: 'Logout'},
        ]
        elements.forEach((element) => {
            const li = document.createElement('li')
            li.textContent = element.label
            list.appendChild(li)
        });

        list.classList.toggle('show')
        if (list.classList.contains('show')) {
            listContainer.style.marginBottom = `${list.offsetHeight + 10}px`; // Move the entire dropdown down
        } else {
            listContainer.style.marginBottom = ''; // Reset the margin when closed
        }
    })
    listContainer.appendChild(list)
    listContainer.appendChild(listBtn)
    container.appendChild(listContainer)
}

//list of upcoming tournament where user is registered but not yet started (show/upcoming)
function createUpcomingTour () {

}

//list of ongoing tournament, use this to pick created by user by id and give the possibility to cancel
function createOnGoingTour () {

}

function joinModal() {
    const overlay = document.getElementById('overlay')
    const joinModal = document.createElement('div')
    joinModal.id = 'join-modal'

    const aliasInput = document.createElement('input')
    aliasInput.id = 'alias-input'
    const exitMessage = document.createElement('p')
    exitMessage.innerText = 'Choose your alias for the tournament'


    const registerButton = document.createElement('button')
    registerButton.id = 'reg-button'
    registerButton.innerText = 'Register'
    registerButton.addEventListener('click', () => {
        const alias = aliasInput.value()
        joinModal.remove()
        return (alias)
    })

    const cancelButton = document.createElement('button')
    cancelButton.id = 'cancel-reg'
    cancelButton.innerText = 'Cancel'
    cancelButton.addEventListener('click', () => {
        joinModal.remove()
        return (null)
    })


    joinModal.appendChild(exitMessage)
    joinModal.appendChild(aliasInput)
    joinModal.appendChild(yesButton)
    joinModal.appendChild(noButton)

    
    overlay.appendChild(exitContainer)
}