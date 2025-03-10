
  // Like when publishing a topic, we first create a Topic object with details of the topic's name
  // and message type. Note that we can call publish or subscribe on the same topic object.
  import { start_game } from "../js/game_script.js";
  import { ros } from "./ros_connection.js";
  const JoyNodeSubStatus = document.getElementById("joy_node-sub-status")

  let currentPosition = 50
  const playerPaddle = document.querySelector(".paddle.right"); // Select the left paddle
  let lastEventTime = 0;  // Timestamp of the last event
  
  
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : '/joy',
    messageType : 'sensor_msgs/msg/Joy'
  });
  let timeDifference = 0;

  // Then we add a callback to be called every time a message is published on this topic.
  listener.subscribe(function(message) {
  	// testSecretInfoTextbox.textContent = JSON.stringify(data);
    JoyNodeSubStatus.style.backgroundColor = 'green';
    console.log("hi" + start_game)
    
    const currentTime = Date.now();  // Get current time in milliseconds
    timeDifference = currentTime - lastEventTime;  // Time between last event and this one
    lastEventTime = currentTime;
    setTimeout(check_connection, 200);

    if (start_game == false)
      return;

    // console.log("%c time diff: " + timeDifference, 'color: red');
    // console.log('Received message on ' + listener.name + ': ' + message.data);
    // console.log('Axes:', message.axes, 'Buttons:', message.buttons);
    console.log('Axis 0:', message.axes[0], 'Button 0:', message.buttons[0]);

    // If desired, we can unsubscribe from the topic as well.
    //document.getElementById('data').style.display = 'inline';
	//    listener.unsubscribe();
    const step = message.axes[0]
    currentPosition = currentPosition + step;

    // Create a string from the message (e.g., showing axes and buttons)
    const dataStr = 'Axes: ' + message.axes.join(', ') + '<br>' +
                    'Buttons: ' + message.buttons.join(', ');
    playerPaddle.style.setProperty("--position", currentPosition);

    // Display the data in the <p id="data"> element
    // const dataElement = document.getElementById('data');
    // dataElement.innerHTML = dataStr;
    // dataElement.style.display = 'block';
  });

  function check_connection() {
    const currentTime = Date.now();
    console.log('timedif in setTimeout: ' + (currentTime - lastEventTime))
    if ((currentTime - lastEventTime) >= 170)
    {
      JoyNodeSubStatus.style.backgroundColor = 'red';

      console.log('aaa ')
    }
  };
