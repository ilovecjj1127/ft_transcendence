import { getCanvasContent } from "../menu/select-menu.js"

const canvas = getCanvasContent().canvas
const ctx = getCanvasContent().ctx

export default class Block {
	constructor (size, speed) {
		this.x = canvas.width + size
		this.y = 400 - size
		this.size = size
		this.color = "red"
		this.slideSpeed = speed
	}
	
	draw() {
		ctx.fillStyle = this.color
		ctx.fillRect(this.x, this.y, this.size, this.size)
	}
	
	slide() {
		this.draw()
		this.x -= this.slideSpeed
	}
}