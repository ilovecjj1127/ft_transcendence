
export default class Paddle{
	constructor(paddleElem_) {
		this.paddleElem = paddleElem_;
		this.reset()
	}

	get position() {
		return parseFloat(
			getComputedStyle(this.paddleElem).getPropertyValue("--position")
		)
	}

	set position(value)
	{
		this.paddleElem.style.setProperty("--position", value)
	}

	reset() {
   		this.position = 50
  	}

	rect() {
		return this.paddleElem.getBoundingClientRect()
	}
}