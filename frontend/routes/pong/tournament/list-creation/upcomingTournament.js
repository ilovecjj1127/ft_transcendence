import { checkToken, deleteTokenReload } from "../../../../utils/token.js"
import { getUserToken, getUsername, getLanguage} from "../../../../utils/userData.js"
import { translations } from "../../../../multilang/dictionary.js" 

//list of upcoming tournament where user is registered but not yet started (show/upcoming)
// use this to pick created by user by id and give the possibility to cancel
export function createUpcomingTour (container) {
    
    const listContainer = document.createElement('div')
    listContainer.classList.add('dropdown')
    const listBtn = document.createElement('button')
    listBtn.classList.add('dropdown-button')
    listBtn.innerText = translations[getLanguage()]['upTour']
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
        if (listResponse.status == 401) deleteTokenReload()
        if (listResponse.ok) {
            const data = await listResponse.json()
            if (data.length === 0) {
                const noTournamentsMessage = document.createElement('p')
                noTournamentsMessage.textContent = translations[getLanguage()]['noUpcoming']
                list.appendChild(noTournamentsMessage);
            } else {
            data.forEach((tour) => {
                const li = document.createElement('li')
                li.innerHTML = `${tour.name} 
                - players ${tour.players.length}/${tour.max_players}`
                if (tour.creator_username == getUsername()) {
                    const btnContainer = document.createElement('div')
                    btnContainer.id = 'upcomingBtn'
                    
                    if (tour.players.length >= tour.min_players) {
                        const startButton = document.createElement('button')
                        startButton.innerText = translations[getLanguage()]['start']
                        startButton.addEventListener('click', () => startTournament(tour.id, li, startButton))
                        btnContainer.appendChild(startButton)
                    }
                    
                    const cancelButton = document.createElement('button')
                    cancelButton.innerText = translations[getLanguage()]['cancel']
                    btnContainer.appendChild(cancelButton)
                    cancelButton.addEventListener('click', () => cancelTournament(tour.id, li, cancelButton))
                    li.appendChild(btnContainer)
                }
                list.appendChild(li)
            })
        }
        } else {
            const li = document.createElement()
            li.textContent = translations[getLanguage()]['tourError']
            list.appendChild(li)
        }
        list.classList.toggle('show')
        if (list.classList.contains('show')) {
            listContainer.style.marginBottom = `${list.offsetHeight + 10}px`
        } else {
            listContainer.style.marginBottom = ''
        }
}

async function cancelTournament (id, li, button) {
    console.log("clicked cancel")
    const isTokenValid = await checkToken()
    if (!isTokenValid) return
    
    const cancelResponse = await fetch(`http://${window.location.host}/api/tournament/cancel/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
        body: JSON.stringify({
            tournament_id: id,
        }),
    });
    if (cancelResponse.status == 401) deleteTokenReload()
    if (cancelResponse.ok) {
        li.remove()
    } else {
        button.innerText = translations[getLanguage()]['error']
        button.style.backgroundColor = "red"
        button.style.color = "white"
        button.disabled = true
    }                
}

async function startTournament (id, li, button) {
    console.log("clicked cancel")
    const isTokenValid = await checkToken()
    if (!isTokenValid) return
    
    const startResponse = await fetch(`http://${window.location.host}/api/tournament/start/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
        body: JSON.stringify({
            tournament_id: id,
        }),
    });
    if (startResponse.status == 401) deleteTokenReload()
    if (startResponse.ok) {
        li.remove()
    } else {
        button.innerText = translations[getLanguage()]['error']
        button.style.backgroundColor = "red"
        button.style.color = "white"
        button.disabled = true
    }  
}