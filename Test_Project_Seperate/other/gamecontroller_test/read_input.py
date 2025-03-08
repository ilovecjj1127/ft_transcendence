from evdev import InputDevice, categorize, ecodes

# Open the joystick interface
gamepad = InputDevice('/dev/input/js0')

print("Listening for controller inputs...")
for event in gamepad.read_loop():
    if event.type == ecodes.EV_ABS:  # Analog sticks
        print(f"ABS {event.code}: {event.value}")
    elif event.type == ecodes.EV_KEY:  # Buttons
        print(f"KEY {event.code}: {event.value}")

