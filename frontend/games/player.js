const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

export default class Player {
	constructor (x, y, size, color) {
		this.x = x
		this.y = y
		this.size = size
		this.color = color

		//jump configuration
		this.jumpHeight = 12
		this.shouldJump = false
		this.jumpCounter = 0 //frame counter

		//spin animation
		this.spin = 0
		this.spinIncrement = 90/32 //rotation of 90 degrees over 32 frames
	}

	rotation() {
		let offsetXPosition = this.x + (this.size / 2) //store the position of
		let offsetYPosition = this.y + (this.size / 2)// the player square
		
		//because the canvas rotation point is by default the top left corner (0,0)
		//to get the rotation movement, need to move the canvas origin to the
		//center point of the square to get a correct rotation animation
		//need to move the canvas back to the original position after rotating 
		//the square and before drawing onto the canvas

		ctx.translate(offsetXPosition, offsetYPosition)

		//Division to convert degrees into radiant
		ctx.rotate(this.spin * Math.PI / 180)
		ctx.rotate(this.spinIncrement * Math.PI / 180)
		ctx.translate(-offsetXPosition, -offsetYPosition)

		//4.5 because 90/20 (number of iteration in jump, frames)
		this.spin += this.spinIncrement
	}

	counterRotation() {
		//this rotate the cube back to its origin so it can be moved up properly
		let offsetXPosition = this.x + (this.size / 2)
		let offsetYPosition = this.y + (this.size / 2)
		ctx.translate(offsetXPosition, offsetYPosition)
		ctx.rotate(-this.spin * Math.PI / 180)
		ctx.translate(-offsetXPosition, -offsetYPosition)
	}

	jump() {
		if (this.shouldJump) {
			this.jumpCounter++
			if (this.jumpCounter < 15) {
				this.y -= this.jumpHeight //go up
			} else if (this.jumpCounter > 14 && this.jumpCounter < 19) {
				this.y += 0
			} else if (this.jumpCounter < 33 ) {
				this.y += this.jumpHeight; //go down
			}
			this.rotation()
			//end cycle
			if (this.jumpCounter >= 32) {
				this.counterRotation()
				this.spin = 0
				this.shouldJump = false
			}
		}
	}

	draw() {
		this.jump()
		ctx.fillStyle = this.color
		ctx.fillRect(this.x, this.y, this.size, this.size)
		
		//reset the rotation so the rotation of the other elements is not changed
		if (this.shouldJump) this.counterRotation()
	}

}