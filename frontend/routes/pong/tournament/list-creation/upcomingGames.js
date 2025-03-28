import { checkToken } from "../../../../utils/token.js"
import { getUserId, getUserToken } from "../../../../utils/userData.js"

//list of next games to play (show/ready/games)
export function createUpcomingGames (container) {
    const listContainer = document.createElement('div')
    listContainer.classList.add('dropdown')
    const listBtn = document.createElement('button')
    listBtn.classList.add('dropdown-button')
    listBtn.innerText = "Upcoming Games"
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

    const listResponse = await fetch(`http://${window.location.host}/api/tournament/show/ready/games`, {
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
            noTournamentsMessage.textContent = "No games available for tournaments. Come back later"
            list.appendChild(noTournamentsMessage)
        } else {
            data.forEach((game) => {
                const li = document.createElement('li')
                //change player with alias and check for right one 
                li.textContent = game.id + ' vs ' + game.player2
                const button = document.createElement('button')
                button.innerText = "Play"
                li.appendChild(button)
                list.appendChild(li)
                button.addEventListener('click', playGame)
            })
        }
    } else {
        const li = document.createElement()
        li.textContent = "Error retrieving Tournament. Try again later"
        list.appendChild(li)
    }

    //maybe this part at the beggining with a return to not send the request if not showing the list
    list.classList.toggle('show')
    if (list.classList.contains('show')) {
        listContainer.style.marginBottom = `${list.offsetHeight + 10}px`
    } else {
        listContainer.style.marginBottom = ''
    }
}

async function playGame () {
    alert('button to play the game pressed')
}