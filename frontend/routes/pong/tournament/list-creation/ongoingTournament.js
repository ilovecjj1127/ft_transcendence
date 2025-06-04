import { checkToken, deleteTokenReload} from "../../../../utils/token.js"
import { getUserId, getUserToken } from "../../../../utils/userData.js"

//list of ongoing tournament
export function createOnGoingTour (container) {
    
    const listContainer = document.createElement('div')
    listContainer.classList.add('dropdown')
    const listBtn = document.createElement('button')
    listBtn.classList.add('dropdown-button')
    listBtn.innerText = "Ongoing Tournaments"
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

        const listResponse = await fetch(`https://${window.location.host}/api/tournament/show/ongoing`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getUserToken().access}`
            },
        });
        if (listResponse.status == 401) deleteTokenReload()
        if (listResponse.ok) {
            const data = await listResponse.json()
            if (data.length == 0) {
                const noTournamentsMessage = document.createElement('p')
                noTournamentsMessage.textContent = "No ongoing tournaments available."
                list.appendChild(noTournamentsMessage)
            } else {
            data.forEach((tour) => {
                const li = document.createElement('li')
                li.textContent = tour.name
                const button = document.createElement('button')
                button.innerText = "Leaderboard"
                li.appendChild(button)
                list.appendChild(li)
                button.addEventListener('click', () => {
                    const tourInfo = {}
                    tourInfo.id = tour.id
                    tourInfo.name = tour.name
                    localStorage.setItem("tourInfo", JSON.stringify(tourInfo))
                    location.hash = '/leaderboard'
                })
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