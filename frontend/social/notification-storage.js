export function saveGameNotification (gameId, opponent) {
    let notifications = JSON.parse(localStorage.getItem("game-notifier")) || []

    const isDuplicate = notifications.some(notifier => notifier.gameId == gameId)
    if (!isDuplicate) {
        notifications.push({gameId, opponent})
        localStorage.setItem("game-notifier", JSON.stringify(notifications))
    }
}

export function removeGameNotification (gameId) {
    let notifications = JSON.parse(localStorage.getItem("game-notifier")) || []
    notifications = notifications.filter(notifier => notifier.gameId != gameId)

    const list = document.querySelector(`#received-tab ul`)

    const entries = list.querySelectorAll('li')
    entries.forEach(li => {
        if (li.dataset.gameId == gameId) list.removeChild(li)
    })

    localStorage.setItem("game-notifier", JSON.stringify(notifications))
}

export function fillGameNotification () {
    let notifications = JSON.parse(localStorage.getItem("game-notifier")) || []
    const list = document.querySelector(`#received-tab ul`)

    notifications.forEach(({gameId, opponent}) => {
        const li = document.createElement('li')
        li.innerText = `${opponent} has started game ${gameId} with you`
        li.dataset.gameId = gameId
        const btnContainer = document.createElement('div')
        const removeBtn = document.createElement('button')
        removeBtn.innerText = "✖"

        removeBtn.addEventListener("click", () => {
            removeGameNotification(gameId)
        })
        btnContainer.appendChild(removeBtn)
        li.appendChild(btnContainer)
        list.appendChild(li)
    });
}