from pymavlink import mavutil


def arm(connection: mavutil.mavserial):
    connection.mav.command_long_send(
        connection.target_system,
        connection.target_component,
        mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM,
        0,
        1, 0, 0, 0, 0, 0, 0
    )

def disarm(connection: mavutil.mavserial):
    connection.mav.command_long_send(
        connection.target_system,
        connection.target_component,
        mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM,
        0,
        0, 0, 0, 0, 0, 0, 0
    )

def takeoff(connection: mavutil.mavserial, height: float):
    connection.mav.command_long_send(
                connection.target_system,  
                connection.target_component,
                mavutil.mavlink.MAV_CMD_NAV_TAKEOFF, 
                0, # confirmation
                0, # param1 
                0, # param2
                0, # param3 
                0, # param4
                0, # param5
                0, # param6
                height) # param7

def set_mode(connection: mavutil.mavserial, mode: str | int):
    if isinstance(mode, str):
            mode = mode.upper()
            mode_map = connection.mode_mapping()
            if mode_map is None or mode not in mode_map:
                raise ValueError(f"Unknown mode '{mode}'")
            mode = mode_map[mode]

    connection.set_mode(mode)