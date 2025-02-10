let player1Direction = 0
let player2Direction = 0

window.addEventListener ('keydown', e => {
	switch (e.key) {
		case 'ArrowUp' :
			player2Direction = -0.5
			break
		case 'ArrowDown' :
			player2Direction = 0.5
			break
		case 'w' :
			player1Direction = -0.5
			break
		case 's' :
			player1Direction = 0.5
	}
})

window.addEventListener ('keyup', e => {
	switch (e.key) {
		case 'ArrowUp' :
			player2Direction = 0
			break
		case 'ArrowDown' :
			player2Direction = 0
			break
		case 'w' :
			player1Direction = 0
			break
		case 's' :
			player1Direction = 0
	}
})


export function getInputDirection() {
	return { player1 : player1Direction, player2 : player2Direction }
}