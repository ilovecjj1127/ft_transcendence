function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  
  function getRandomRotationSpeed() {
    return Math.random() * 2 + 0.5
  }
  
  // Function to generate a random rotation direction (clockwise or counter-clockwise)
  function getRandomRotationDirection() {
    return Math.random() > 0.5 ? 1 : -1 // Randomly returns 1 (clockwise) or -1 (counter-clockwise)
  }
  
  // Function to randomly move and rotate the faces
export function moveFaces() {
    const faces = document.querySelectorAll('.face')
  
    faces.forEach(face => {
      // Randomize the initial position, speed, rotation speed, and direction
      let x = getRandomInt(0, window.innerWidth - 100)  // Random X position
      let y = getRandomInt(0, window.innerHeight - 100) // Random Y position
      let speedX = getRandomInt(1, 3) // Horizontal speed
      let speedY = getRandomInt(1, 3) // Vertical speed
      let rotationSpeed = getRandomRotationSpeed() // Random rotation speed (degrees per frame)
      let rotationDirection = getRandomRotationDirection()// Random rotation direction (-1 or 1)
  
      // Set the initial position of the face
      face.style.left = `${x}px`
      face.style.top = `${y}px`
  
      // Variable to track the current rotation angle
      let currentRotation = 0
  
      // Function to animate the movement and rotation
      function animate() {
        // Move face by speed values
        x += speedX
        y += speedY
  
        // Bounce off the edges of the screen
        if (x <= 0 || x >= window.innerWidth - 100) {
          speedX = -speedX // Reverse horizontal direction
        }
        if (y <= 0 || y >= window.innerHeight - 100) {
          speedY = -speedY // Reverse vertical direction
        }
  
        // Continuously rotate the face in a random direction
        currentRotation += rotationSpeed * rotationDirection  // Increment the rotation angle
        if (currentRotation >= 360) {
          currentRotation = 0 // Reset the rotation angle if it exceeds 360
        }
        face.style.transform = `rotate(${currentRotation}deg)`; // Apply the rotation
  
        // Update the position of the face
        face.style.left = `${x}px`
        face.style.top = `${y}px`
  
        // Call the animation function repeatedly for smooth animation
        requestAnimationFrame(animate)
      }
  
      // Start the animation for each face
      animate()
    })
  }