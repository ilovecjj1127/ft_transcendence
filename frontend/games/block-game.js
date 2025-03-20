import Player from "./player.js"
import Block from "./block.js"

//canvas
const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")
const fps = 60
const msPerFrame = 1000 / fps

export default class BlockGame {
    constructor(restart) {
        this.timeOutId = 0
        this.timeOutId2 = 0
        this.animationId = null
        this.msPrev = window.performance.now()
        this.start()
        this.restart = restart

        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.restartGame = this.restartGame.bind(this)
        this.stop = this.stop.bind(this)
        this.animate = this.animate.bind(this)

        window.addEventListener('keydown', this.handleKeyDown)
        this.restart.addEventListener('click', this.restartGame)
    }
    
    start() {
        this.player = new Player(150, 350, 50, "#facf45")
        this.arrayBlocks = []
        this.presetTime = 1000 //block spawn timer in ms
        this.blockSpeed = 6
        this.score = 0
        this.scoreIncrement = 0
        this.canScore = true
    }

    drawBackgroundLine() {
        ctx.beginPath()
        ctx.moveTo(0, 400)
        ctx.lineTo(800, 400)
        ctx.lineWidth = 2.9
        ctx.strokeStyle = "white"
        ctx.stroke()
    }

    drawScore() {
        ctx.font = "80px Arial"
        ctx.fillStyle = "#facf45"
        let scoreString = this.score.toString()
        let xOffset = ((scoreString.length - 1) * 20)
        ctx.fillText(scoreString, 380 - xOffset, 100)
    }

    restartGame() {
        this.restart.style.display = "none" //mmmmmm
        this.start()
        requestAnimationFrame(this.animate)
    }

    generateBlocks() {
        let timeDelay = this.randomNumberInterval(this.presetTime)
        this.arrayBlocks.push(new Block(50, this.blockSpeed))
        
        this.timeOutId = setTimeout(() => this.generateBlocks(), timeDelay)
    }
    
    blockCollision(player, block) {
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
    
    isPastBlock(player, block) {
        return( 
            player.x + (player.size / 2) > block.x + (block.size / 4) &&
            player.x + (player.size / 2) < block.x + (block.size / 4) * 3
        )
    }
    
    increaseSpeed() {
        if (this.scoreIncrement + 10 == this.score) {
            this.scoreIncrement = this.score
            this.blockSpeed++
            //increase the blocks spawn
            this.presetTime >= 100 ? this.presetTime -= 100 : this.presetTime = this.presetTime / 2
            //update speed of existing blocks
            this.arrayBlocks.forEach(block => {
                block.slideSpeed = this.blockSpeed
            })
        }
    }
    
    animate() {
        this.animationId = requestAnimationFrame(this.animate)
        
        //control fps
        const msNow = window.performance.now()
        const msPassed = msNow - this.msPrev
        if (msPassed < msPerFrame)	return
    
        const excessTime = msPassed % msPerFrame
        this.msPrev = msNow - excessTime
        
        ctx.clearRect(0,0, canvas.width, canvas.height)
        this.drawBackgroundLine()
        this.drawScore()
        this.player.draw()
        this.increaseSpeed()
        
        this.arrayBlocks.forEach((arrayBlock, index) => {
            arrayBlock.slide()
            
            //end game is player collides with a block
            if (this.blockCollision(this.player, arrayBlock)) {
                this.restart.style.display = "block" ////mmmmmm
                cancelAnimationFrame(this.animationId)
            }
            //check if player is over the block to score
            if (this.isPastBlock(this.player, arrayBlock) && this.canScore){
                this.canScore = false
                this.score++
            }
            //delete block after he exit the canvas
            if ((arrayBlock.x + arrayBlock.size) <= 0) {
                setTimeout(() => {
                    this.arrayBlocks.splice(index, 1) // splice method remove 1 object at the index
                }, 0)
            }
        })
    }
    
    handleKeyDown(e) {
        if (e.code == "Space" || e.key == "32" || e.key == " " ) {
            if (!this.player.shouldJump) {
                this.player.jumpCounter = 0
                this.player.shouldJump = true
                this.canScore = true  
            }
        }
    }
    
    playBlock() {
        this.start()
        this.animate()
        this.timeOutId2 = setTimeout(() => {this.generateBlocks()}, this.randomNumberInterval(this.presetTime))
    }
    
    randomNumberInterval(timeInterval) {
        let returnTime = timeInterval
        if (Math.random () < 0.5) {
            returnTime += getRandomNumber(this.presetTime / 3, this.presetTime * 1.5)
        } else {
            returnTime -= getRandomNumber(this.presetTime / 5, this.presetTime / 2)
        }
        return returnTime
    }

    stop() {
        this.destroy()
        location.hash = '/'
    }

    destroy () {
        window.removeEventListener('keydown', this.handleKeyDown)
        this.restart.removeEventListener('click', this.restartGame)
        cancelAnimationFrame(this.animationId)
		this.animationId = null;
		clearTimeout(this.timeOutId)
		clearTimeout(this.timeOutId2)
    }
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
