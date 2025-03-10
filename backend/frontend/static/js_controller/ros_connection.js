  // Connecting to ROS
  // -----------------
  export let ros = new ROSLIB.Ros();

  const ConnectionStatus = document.getElementById("ws-status")

  // If there is an error on the backend, an 'error' emit will be emitted.
  ros.on('error', function(error) {

    ConnectionStatus.textContent = JSON.stringify(error);

    // document.getElementById('connecting').style.display = 'none';
    // document.getElementById('connected').style.display = 'none';
    // document.getElementById('closed').style.display = 'none';
    // document.getElementById('error').style.display = 'inline';
    console.log('error' + error);
  });

  // Find out exactly when we made a connection.
  ros.on('connection', function() {
    console.log('Connection made!');

    ConnectionStatus.textContent = JSON.stringify('Connection made!');

    // document.getElementById('connecting').style.display = 'none';
    // document.getElementById('error').style.display = 'none';
    // document.getElementById('closed').style.display = 'none';
    // document.getElementById('connected').style.display = 'inline';
  });

  ros.on('close', function() {
    console.log('Connection closed.');
    ConnectionStatus.textContent = JSON.stringify('Connection closed.');

    // document.getElementById('connecting').style.display = 'none';
    // document.getElementById('connected').style.display = 'none';
    // document.getElementById('closed').style.display = 'inline';
  });

  // Create a connection to the rosbridge WebSocket server.
  ros.connect('ws://localhost:9090');
