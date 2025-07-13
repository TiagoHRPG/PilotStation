import threading
import queue
import time
from pymavlink import mavutil
from retrieve_params import retrieve_params

message_queue = queue.Queue()
master = mavutil.mavlink_connection('127.0.0.1:14562')


def is_armed(msg):
    return bool(msg.base_mode & mavutil.mavlink.MAV_MODE_FLAG_SAFETY_ARMED)

class Drone(object):
    def __init__(self):
        self.pos_x = 0
        self.pos_y = 0
        self.pos_z = 0

        self.waypoint_distance = 0

        self.baterry_level = 100
        self.mode = 'STABILIZE'
        self.armed = False
        
        # VFR_HUD
        self.airspeed = 0
        self.groundspeed = 0
        self.heading = 0
        self.throttle = 0
        self.altitude = 0
        self.climb = 0

        self.parameters = dict()

    def print(self):
        print("\n")
        print("pos_x: ", self.pos_x)
        print("pos_y: ", self.pos_y)   
        print("pos_z: ", self.pos_z)
        print("waypoint_distance: ", self.waypoint_distance)
        print("baterry_level: ", self.baterry_level)
        print("mode: ", self.mode)
        print("armed: ", self.armed)

        print("\n")
        print("---VRF HUD info---")
        print("airspeed: ", self.airspeed)
        print("groundspeed: ", self.groundspeed)
        print("heading: ", self.heading)
        print("throttle: ", self.throttle)
        print("altitude: ", self.altitude)
        print("climb: ", self.climb)
        print("\n")


def update_info(msg):
    if msg.get_type() == 'LOCAL_POSITION_NED':
        drone.pos_x = msg.x
        drone.pos_y = msg.y
        drone.pos_z = msg.z
    elif msg.get_type() == 'NAV_CONTROLLER_OUTPUT':
        drone.waypoint_distance = msg.wp_dist
    elif msg.get_type() == 'BATTERY_STATUS':
        drone.baterry_level = msg.battery_remaining
    elif msg.get_type() == 'HEARTBEAT':
        drone.armed = is_armed(msg)
    elif msg.get_type() == 'VFR_HUD':
        drone.airspeed = msg.airspeed
        drone.groundspeed = msg.groundspeed
        drone.heading = msg.heading 
        drone.throttle = msg.throttle   
        drone.altitude = msg.alt
        drone.climb = msg.climb

    drone.mode = master.flightmode

def read_mavlink():
    while True:
        time.sleep(0.001)
        msg = master.recv_match()
        if msg:
            message_queue.put(msg)
        


def process_messages():
    start_time = time.time()

    while True:
        time.sleep(0.001)
        if not message_queue.empty():
            msg = message_queue.get()
            if msg is not None:
                print(msg)
        
                update_info(msg)
                if msg.get_type() == 'COMMAND_ACK':
                    if msg.command == mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM and msg.result == 0:
                        global armed_ack
                        armed_ack = True
        
        if time.time() - start_time > 1:
            start_time = time.time()
            
            #drone.print()


def arm():
    time.sleep(15)
    master.mav.command_long_send(
        master.target_system,
        master.target_component,
        mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM,
        0,
        1, 0, 0, 0, 0, 0, 0
    )

    start_time = time.time()
    while True:
        if armed_ack:
            print("Drone is arming")
            break
        elif drone.armed:
            print("Drone is armed")
            break
        elif time.time() - start_time > 2:
            print("Arming failed after 2 seconds")
            break


armed_ack = False
# setup
drone = Drone()

master.wait_heartbeat()
drone.parameters = retrieve_params(master)

# main loop
threading.Thread(target=read_mavlink).start()
threading.Thread(target=process_messages).start()
threading.Thread(target=arm).start()