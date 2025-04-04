import { checkToken } from "../../../../utils/token.js"
import { getUserId, getUserToken } from "../../../../utils/userData.js"

//list of joinable tournaments (show/registration)
export function createOpenRegistration (container) {
    
    const listContainer = document.createElement('div')
    listContainer.classList.add('dropdown')
    const listBtn = document.createElement('button')
    listBtn.classList.add('dropdown-button')
    listBtn.innerText = "Registration open"
    const list = document.createElement('ul')
    list.classList.add('dropdown-list')

    listBtn.addEventListener('click', () => requestList(list, listContainer))

    listContainer.appendChild(list)
    listContainer.appendChild(listBtn)
    container.appendChild(listContainer)
}

async function requestList (list, listContainer) {
    list.innerHTML = ''

    const isTokenValid = await checkToken()
    if (!isTokenValid) return

    const listResponse = await fetch(`http://${window.location.host}/api/tournament/show/registration/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
    });
    if (listResponse.ok) {
        const data = await listResponse.json()
        if (data.length === 0) {
            const noTournamentsMessage = document.createElement('p')
            noTournamentsMessage.textContent = "No tournaments available for registration."
            list.appendChild(noTournamentsMessage)
        } else {
            data.forEach((tour) => {
                const li = document.createElement('li')
                li.textContent = tour.name
                const button = document.createElement('button')
                button.innerText = "Register"
                li.appendChild(button)
                list.appendChild(li)
                button.addEventListener('click', () => registerTournament(tour.id, button))
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
} 

async function registerTournament (id, button) {
      const alias = await createJoinModal()
      if (alias) {
          const isTokenValid = await checkToken()
          if (!isTokenValid) return
          
          const registrResponse = await fetch(`http://${window.location.host}/api/tournament/join/`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${getUserToken().access}`
              },
              body: JSON.stringify({
                  tournament_id: id,
                  alias: alias, 
              }),
          });
          if (registrResponse.ok) {
                alert('registered correctly')
                //change button style
                button.innerText = "✔"
                button.style.backgroundColor = "#4CAF50"
                button.style.color = "white"
                button.disabled = true
          } else {
              //add error box
              alert('error registration')
          }
      }                    
}

async function createJoinModal() {
    return new Promise((resolve) => {

        const overlay = document.querySelector('.overlay')
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
            const alias = aliasInput.value
            joinModal.remove()
            resolve(alias)
        })
        
        const cancelButton = document.createElement('button')
        cancelButton.id = 'cancel-reg'
        cancelButton.innerText = 'Cancel'
        cancelButton.addEventListener('click', () => {
            joinModal.remove()
            resolve(null)
        })
        
        const btnContainer = document.createElement('div')
        btnContainer.id = "join-btn-container"

        joinModal.appendChild(exitMessage)
        joinModal.appendChild(aliasInput)
        btnContainer.appendChild(registerButton)
        btnContainer.appendChild(cancelButton)
        joinModal.appendChild(btnContainer)
        
        overlay.appendChild(joinModal)
    })
}