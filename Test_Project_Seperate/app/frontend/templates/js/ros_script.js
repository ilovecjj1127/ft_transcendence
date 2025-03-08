  // Connecting to ROS
  // -----------------
  var ros = new ROSLIB.Ros();

  // If there is an error on the backend, an 'error' emit will be emitted.
  ros.on('error', function(error) {
    document.getElementById('connecting').style.display = 'none';
    document.getElementById('connected').style.display = 'none';
    document.getElementById('closed').style.display = 'none';
    document.getElementById('error').style.display = 'inline';
    console.log(error);
  });

  // Find out exactly when we made a connection.
  ros.on('connection', function() {
    console.log('Connection made!');
    document.getElementById('connecting').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('closed').style.display = 'none';
    document.getElementById('connected').style.display = 'inline';
  });

  ros.on('close', function() {
    console.log('Connection closed.');
    document.getElementById('connecting').style.display = 'none';
    document.getElementById('connected').style.display = 'none';
    document.getElementById('closed').style.display = 'inline';
  });

  // Create a connection to the rosbridge WebSocket server.
  ros.connect('ws://localhost:9090');


  
  // Publishing a Topic
  // ------------------

  // First, we create a Topic object with details of the topic's name and message type.
  var cmdVel = new ROSLIB.Topic({
    ros : ros,
    name : '/cmd_vel',
    messageType : 'geometry_msgs/Twist'
  });

  // Then we create the payload to be published. The object we pass in to ros.Message matches the
  // fields defined in the geometry_msgs/Twist.msg definition.
  var twist = new ROSLIB.Message({
    linear : {
      x : 0.1,
      y : 0.2,
      z : 0.3
    },
    angular : {
      x : -0.1,
      y : -0.2,
      z : -0.3
    }
  });

  // And finally, publish.
  cmdVel.publish(twist);

  //Subscribing to a Topic
  //----------------------

  // Like when publishing a topic, we first create a Topic object with details of the topic's name
  // and message type. Note that we can call publish or subscribe on the same topic object.
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : '/joy',
    messageType : 'sensor_msgs/msg/Joy'
  });

  // Then we add a callback to be called every time a message is published on this topic.
  listener.subscribe(function(message) {
    console.log('Received message on ' + listener.name + ': ' + message.data);
      console.log('Axes:', message.axes, 'Buttons:', message.buttons);
      console.log('Axis 0:', message.axes[0], 'Button 0:', message.buttons[0]);

    // If desired, we can unsubscribe from the topic as well.
    //document.getElementById('data').style.display = 'inline';
	//    listener.unsubscribe();

    // Create a string from the message (e.g., showing axes and buttons)
    const dataStr = 'Axes: ' + message.axes.join(', ') + '<br>' +
                    'Buttons: ' + message.buttons.join(', ');

    // Display the data in the <p id="data"> element
    const dataElement = document.getElementById('data');
    dataElement.innerHTML = dataStr;
    dataElement.style.display = 'block';
  });

  // Calling a service
  // -----------------

  // First, we create a Service client with details of the service's name and service type.
  var addTwoIntsClient = new ROSLIB.Service({
    ros : ros,
    name : '/add_two_ints',
    serviceType : 'rospy_tutorials/AddTwoInts'
  });

  // Then we create a Service Request. The object we pass in to ROSLIB.ServiceRequest matches the
  // fields defined in the rospy_tutorials AddTwoInts.srv file.
  var request = new ROSLIB.ServiceRequest({
    a : 1,
    b : 2
  });

  // Finally, we call the /add_two_ints service and get back the results in the callback. The result
  // is a ROSLIB.ServiceResponse object.
  addTwoIntsClient.callService(request, function(result) {
    console.log('Result for service call on ' + addTwoIntsClient.name + ': ' + result.sum);
  });

  // Advertising a Service
  // ---------------------

  // The Service object does double duty for both calling and advertising services
  var setBoolServer = new ROSLIB.Service({
    ros : ros,
    name : '/set_bool',
    serviceType : 'std_srvs/SetBool'
  });

  // Use the advertise() method to indicate that we want to provide this service
  setBoolServer.advertise(function(request, response) {
    console.log('Received service request on ' + setBoolServer.name + ': ' + request.data);
    response['success'] = true;
    response['message'] = 'Set successfully';
    return true;
  });

  // Setting a param value
  // ---------------------

  ros.getParams(function(params) {
    console.log(params);
  });

  // First, we create a Param object with the name of the param.
  var maxVelX = new ROSLIB.Param({
    ros : ros,
    name : 'max_vel_y'
  });

  //Then we set the value of the param, which is sent to the ROS Parameter Server.
  maxVelX.set(0.8);
  maxVelX.get(function(value) {
    console.log('MAX VAL: ' + value);
  });

  // Getting a param value
  // ---------------------

  var favoriteColor = new ROSLIB.Param({
    ros : ros,
    name : 'favorite_color'
  });

  favoriteColor.set('red');
  favoriteColor.get(function(value) {
    console.log('My robot\'s favorite color is ' + value);
  });