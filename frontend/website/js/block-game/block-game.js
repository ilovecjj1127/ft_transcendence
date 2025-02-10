import { getCanvasContent, setMenu, drawMenu, setBlockGameOff, getBlockGameValue } from "../menu/select-menu.js"
import Player from "./player.js"
import Block from "./block.js"

//canvas
const canvas = getCanvasContent().canvas
const ctx = getCanvasContent().ctx

//buttons
const restart = document.getElementById("restart-block")
const backToMenu = getCanvasContent().backToMenu

let timeOutId;
let timeOutId2;
let player = new Player(150, 350, 50, "#facf45")
let arrayBlocks = []
let presetTime = 1000 //block spawn timer in ms
let blockSpeed = 6
let score = 0
let scoreIncrement = 0
let canScore = true
let animationId = null

function drawBackgroundLine() {
	ctx.beginPath()
	ctx.moveTo(0, 400)
	ctx.lineTo(800, 400)
	ctx.lineWidth = 2.9
	ctx.strokeStyle = "white"
	ctx.stroke()
}

function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomNumberInterval(timeInterval) {
	let returnTime = timeInterval
	if (Math.random () < 0.5) {
		returnTime += getRandomNumber(presetTime / 3, presetTime * 1.5)
	} else {
		returnTime -= getRandomNumber(presetTime / 5, presetTime / 2)
	}
	return returnTime
}

function startGame() {
	player = new Player(150, 350, 50, "#facf45")
	arrayBlocks = []
	presetTime = 1000 //block spawn timer in ms
	blockSpeed = 6
	score = 0
	scoreIncrement = 0
	canScore = true
}

function restartGame() {
	restart.style.display = "none"
	startGame()
	requestAnimationFrame(animate)
}

function generateBlocks() {
	let timeDelay = randomNumberInterval(presetTime)
	arrayBlocks.push(new Block(50, blockSpeed))

	timeOutId = setTimeout(generateBlocks, timeDelay)
}

function blockCollision(player, block) {
	//getting a copy to the object, and be able to modify some values
	let s1 = Object.assign(Object.create(Object.getPrototypeOf(player)), player)
	let s2 = Object.assign(Object.create(Object.getPrototypeOf(block)), block)

	s2.size = s2.size - 10
	s2.x = s2.x + 10
	s2.y = s2.y + 10

	return !(
		s1.x > s2.x + s2.size || //R1 is to the right of R2
		s1.x + s1.size < s2.x || //R1 is to the left of R2
		s1.y > s2.y + s2.size || //R1 is below R2
		s1.y + s1.size < s2.y	 //R1 is above R2
	)

}

function drawScore() {
	ctx.font = "80px Arial"
	ctx.fillStyle = "#facf45"
	let scoreString = score.toString()
	let xOffset = ((scoreString.length - 1) * 20)
	ctx.fillText(scoreString, 380 - xOffset, 100)
}

function isPastBlock(player, block) {
	return( 
		player.x + (player.size / 2) > block.x + (block.size / 4) &&
		player.x + (player.size / 2) < block.x + (block.size / 4) * 3
	)
}

function increaseSpeed() {
	if (scoreIncrement + 10 == score) {
		scoreIncrement = score
		blockSpeed++
		//increase the blocks spawn
		presetTime >= 100 ? presetTime -= 100 : presetTime = presetTime / 2
		//update speed of existing blocks
		arrayBlocks.forEach(block => {
			block.slideSpeed = blockSpeed
		})
	}
}

function animate() {
	animationId = requestAnimationFrame(animate)
	ctx.clearRect(0,0, canvas.width, canvas.height)
	drawBackgroundLine()
	drawScore()
	player.draw()
	increaseSpeed()
	
	arrayBlocks.forEach((arrayBlock, index) => {
		arrayBlock.slide()
		
		//end game is player collides with a block
		if (blockCollision(player, arrayBlock)) {
			restart.style.display = "block"
			cancelAnimationFrame(animationId)
		}
		//check if player is over the block to score
		if (isPastBlock(player, arrayBlock) && canScore){
			canScore = false
			score++
		}
		//delete block after he exit the canvas
		if ((arrayBlock.x + arrayBlock.size) <= 0) {
			setTimeout(() => {
				arrayBlocks.splice(index, 1) // splice method remove 1 object at the index
			}, 0)
		}
	})
}

//Event
addEventListener("keydown", e => {
	if (e.code == "Space" || e.key == "32" || e.key == " " ) {
		if (!player.shouldJump) {
			player.jumpCounter = 0
			player.shouldJump = true
			canScore = true  
		}
	}
})

restart.addEventListener("click", function (){
	restartGame()
})

backToMenu.addEventListener("click", function () {
	if (getBlockGameValue()) {

		restart.style.display = "none"
		backToMenu.style.display = "none"
		cancelAnimationFrame(animationId)
		animationId = null;
		ctx.clearRect(0,0, canvas.width, canvas.height)
		clearTimeout(timeOutId)
		clearTimeout(timeOutId2)
		
		setBlockGameOff()
		setMenu(true)
		drawMenu()
	}
})

export function playBlock() {
	backToMenu.style.display = "block"
	setMenu(false)
	startGame()
	animate() 
	timeOutId2 = setTimeout(() => {generateBlocks()}, randomNumberInterval(presetTime))
}