import { checkToken } from "../../../../utils/token.js"
import { getUserId, getUserToken } from "../../../../utils/userData.js"

//list of upcoming tournament where user is registered but not yet started (show/upcoming)
// use this to pick created by user by id and give the possibility to cancel
export function createUpcomingTour (container) {
    
    const listContainer = document.createElement('div')
    listContainer.classList.add('dropdown')
    const listBtn = document.createElement('button')
    listBtn.classList.add('dropdown-button')
    listBtn.innerText = "Upcoming Tournaments"
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

        const listResponse = await fetch(`http://${window.location.host}/api/tournament/show/upcoming`, {
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
                noTournamentsMessage.textContent = "No upcoming tournaments available."
                list.appendChild(noTournamentsMessage);
            } else {
            data.forEach((tour) => {
                const li = document.createElement('li')
                li.textContent = tour.name
                if (data.creator == getUserId()) {
                    const button = document.createElement('button')
                    button.innerText = "Cancel"
                    li.appendChild(button)
                    button.addEventListener('click', () => cancelTournament(tour.id))
                }
                list.appendChild(li)
            })
        }
        } else {
            const li = document.createElement()
            li.textContent = "Error retrieving Tournament. Try again later"
            list.appendChild(li)
        }
        list.classList.toggle('show')
        if (list.classList.contains('show')) {
            listContainer.style.marginBottom = `${list.offsetHeight + 10}px`
        } else {
            listContainer.style.marginBottom = ''
        }
}

async function cancelTournament (id) {
    console.log("clicked cancel")
    const isTokenValid = await checkToken()
    if (!isTokenValid) return
    
    const cancelResponse = await fetch(`http://${window.location.host}/api/tournament/cancel`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
        body: JSON.stringify({
            tournament_id: id,
        }),
    });
    if (cancelResponse.ok) {
        alert('cancelled correctly')
        //change button looking
    } else {
        //add error box
        alert('error registration')
    }                
}