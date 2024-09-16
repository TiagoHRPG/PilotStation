from enum import Enum
import queue
import time
import exceptions
from pymavlink import mavutil
import parameter_retrival
import mavlink_commands as mav
import threading

class Point:
    def __init__(self, x: float, y: float, z: float):
        self.x = x
        self.y = y
        self.z = z
    def __dict__(self):
        return {
            'x': self.x,
            'y': self.y,
            'z': self.z
        }

class mavResult(Enum):
    ACCEPTED = 0
    DENIED = 2
    FAILED = 4
    IDLE = -1

    
class BatteryStatus:
    def __init__(self, level: int):
        self.level : int = level
    
class SystemBaseMode():
    def __init__(self) -> None:
        self.stabilize_mode_enabled : bool = False
        self.auto_mode_enabled : bool = False

        self.manual_input_enabled = False
    
    def update(self, base_mode: int) -> None:
        # guided mode enabled flag not working properly
        self.stabilize_mode_enabled = bool(base_mode & mavutil.mavlink.MAV_MODE_FLAG_STABILIZE_ENABLED)
        self.auto_mode_enabled = bool(base_mode & mavutil.mavlink.MAV_MODE_FLAG_AUTO_ENABLED)
        self.manual_input_enabled = bool(base_mode & mavutil.mavlink.MAV_MODE_FLAG_MANUAL_INPUT_ENABLED)
    

class Drone:
    def __init__(self):
        self.connection = None
        self.system_base_mode = SystemBaseMode()

        self.message_queue = queue.Queue(100)
        self.read_frequency = 1000

        self.position : Point = Point(0, 0, 0)  
        self.waypoint_distance = 0
        self._armed = False
        self.mode = 'STABILIZE'

        self.vfr = {
            'airspeed': 0,
            'groundspeed': 0,
            'heading': 0,
            'throttle': 0,
            'altitude': 0,
            'climb': 0
        }

        self.attitude = {
            'roll': 0,
            'pitch': 0,
            'yaw': 0
        }

        self.ekf_status_report = {
            'velocity_variance': 0,
            'pos_horiz_variance': 0,
            'pos_vert_variance': 0,
            'compass_variance': 0,
        }
        self.ekf_ok = False

        self.battery_status = BatteryStatus(100)

        self.parameters = dict()

        # commands ack
        self.armed_ack : mavResult = mavResult.IDLE
        self.takeoff_ack : mavResult = mavResult.IDLE

        # TODO: implement a class for parameters 
        self.receiving_params = False
        self.param_count = 0

    @property
    def armed(self):   
        return self._armed

    @armed.setter
    def armed(self, value: bool):
        self._armed = value
    
    def is_ekf_ok(self, msg) -> bool:
        attitude_ok = bool(msg.flags & mavutil.mavlink.EKF_ATTITUDE)
        velocity_ok = bool(msg.flags & mavutil.mavlink.EKF_VELOCITY_HORIZ)
        velocity_vert_ok = bool(msg.flags & mavutil.mavlink.EKF_VELOCITY_VERT)
        pos_horiz_ok = bool(msg.flags & mavutil.mavlink.EKF_POS_HORIZ_REL)
        pred_pos_horiz_ok = bool(msg.flags & mavutil.mavlink.EKF_PRED_POS_HORIZ_REL)

        return attitude_ok and velocity_ok and velocity_vert_ok and pos_horiz_ok and pred_pos_horiz_ok

    def _is_armed(self, msg) -> bool:
        is_armed = bool(msg.base_mode & mavutil.mavlink.MAV_MODE_FLAG_SAFETY_ARMED)
        return is_armed

    def _is_heartbeat_from_quadrotor(self, msg):
        return msg.type == mavutil.mavlink.MAV_TYPE_QUADROTOR


    def _update_info(self, msg):
        if msg.get_type() == 'LOCAL_POSITION_NED':
            self.position = Point(msg.x, msg.y, msg.z)
        elif msg.get_type() == 'NAV_CONTROLLER_OUTPUT':
            self.waypoint_distance = msg.wp_dist
        elif msg.get_type() == 'BATTERY_STATUS':
            self.battery_status.level = msg.battery_remaining
        elif msg.get_type() == 'HEARTBEAT' and self._is_heartbeat_from_quadrotor(msg):
            self._armed = self._is_armed(msg)
            self.system_base_mode.update(msg.base_mode)
        elif msg.get_type() == 'VFR_HUD':
            self.vfr['airspeed'] = msg.airspeed
            self.vfr['groundspeed'] = msg.groundspeed
            self.vfr['heading'] = msg.heading
            self.vfr['throttle'] = msg.throttle
            self.vfr['altitude'] = msg.alt
            self.vfr['climb'] = msg.climb
        elif msg.get_type() == 'ATTITUDE':
            self.attitude['roll'] = msg.roll
            self.attitude['pitch'] = msg.pitch
            self.attitude['yaw'] = msg.yaw
        elif msg.get_type() == 'EKF_STATUS_REPORT':
            self.ekf_status_report['velocity_variance'] = msg.velocity_variance
            self.ekf_status_report['pos_horiz_variance'] = msg.pos_horiz_variance
            self.ekf_status_report['pos_vert_variance'] = msg.pos_vert_variance
            self.ekf_status_report['compass_variance'] = msg.compass_variance
            self.ekf_ok = self.is_ekf_ok(msg)


        self.mode = self.connection.flightmode

    def _read_mavlink(self):
        while True:
            time.sleep(1/self.read_frequency)
            msg = self.connection.recv_match()
            if msg:
                self.message_queue.put(msg)

    def _process_messages(self):
        while True:
            time.sleep(1/self.read_frequency)
            if not self.message_queue.empty():
                msg = self.message_queue.get()
                if msg is not None:
                    self._update_info(msg)
                    if msg.get_type() == 'COMMAND_ACK':
                        if msg.command == mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM:
                            self.armed_ack = mavResult(msg.result)
                        if msg.command == mavutil.mavlink.MAV_CMD_NAV_TAKEOFF:
                            self.takeoff_ack =  mavResult(msg.result)
                    if msg.get_type() == 'PARAM_VALUE':
                        self.parameters[msg.param_id] = msg.param_value
            
    def run_message_receiver_threads(self):
        threading.Thread(target=self._read_mavlink).start()
        threading.Thread(target=self._process_messages).start()

    def connect(self, connection_string: str = '') -> None:
        if self.connection is not None:
            raise exceptions.DroneAlreadyConnectedException()
        self.connection : mavutil.mavserial = mavutil.mavlink_connection(connection_string)
        heartbeat_response = self.connection.wait_heartbeat(timeout=3)
        if heartbeat_response is None:
            raise exceptions.ACKTimeoutException("Timeout waiting for heartbeat")
        
        #self.connection.mav.autopilot_version_request_send(self.connection.target_system, self.connection.target_component)
        #msg = self.connection.recv_match(type='AUTOPILOT_VERSION', blocking=True)
        self.parameters, self.param_count = parameter_retrival.retrieve_all_params(self.connection)

    def _wait_arm_ack(self, timeout: float = 0.5) -> None:
        start_time = time.time()
        while time.time() - start_time < timeout:
            if self.armed_ack == mavResult.ACCEPTED:
                self.armed_ack = mavResult.IDLE
                return
            elif self.armed_ack in [mavResult.FAILED, mavResult.DENIED]:
                self.armed_ack = mavResult.IDLE
                raise exceptions.CommandFailedException("Arming failed")
            time.sleep(0.1)

        raise exceptions.ACKTimeoutException("Timeout waiting for arming ACK")
    
    def _wait_takeoff_ack(self, timeout: float = 0.5) -> None:
        start_time = time.time()
        while time.time() - start_time < timeout:
            if self.takeoff_ack == mavResult.ACCEPTED:
                self.takeoff_ack = mavResult.IDLE
                return
            elif self.takeoff_ack in [mavResult.FAILED, mavResult.DENIED]:
                self.takeoff_ack = mavResult.IDLE
                raise exceptions.CommandFailedException("Takeoff failed")
            time.sleep(0.1)

        raise exceptions.ACKTimeoutException("Timeout waiting for takeoff ACK")

    def _wait_for_param_update(self, timeout: float = 0.5) -> None:
        start_time = time.time()   
        old_len_parameters = len(self.parameters)
        while time.time() - start_time < timeout:
            if len(self.parameters) > old_len_parameters:
                print("param updated:", len(self.parameters))
                # reset timeout
                start_time = time.time()
                old_len_parameters = len(self.parameters)
    
    def arm(self) -> None:
        if self.connection is None:
            raise exceptions.DroneNotConnectedException()
        self.armed_ack = mavResult.IDLE

        mav.arm(self.connection)

        self._wait_arm_ack(0.5)

    def takeoff(self, height: float) -> None:
        if self.connection is None:
            raise exceptions.DroneNotConnectedException()
        self.takeoff_ack = mavResult.IDLE
        
        mav.takeoff(self.connection, height)

        self._wait_takeoff_ack(0.5)


    def land(self) -> None:
        if self.connection is None:
            raise exceptions.DroneNotConnectedException()
        
        mav.set_mode(self.connection, 'LAND')

    def get_available_modes(self) -> None:
        if self.connection is None:
            raise exceptions.DroneNotConnectedException()
        return {'modes': list(self.connection.mode_mapping().keys())}

    def set_mode(self, mode: str | int) -> None:
        if self.connection is None:
            raise exceptions.DroneNotConnectedException()
        
        mav.set_mode(self.connection, mode)

    def get_all_parameters(self) -> dict:
        if self.connection is None:
            raise exceptions.DroneNotConnectedException()

        return self.parameters

    def set_parameter(self, param_id: str, value: float) -> None:
        if self.connection is None:
            raise exceptions.DroneNotConnectedException()

        self.connection.param_set_send(param_id, value)

        self._wait_for_param_update(0.3)

        # TODO: return true or false
        print(self.parameters[param_id] == value)

    def get_drone_info(self):
        drone_info = {
            'battery_level': self.battery_status.level,
            'position': self.position.__dict__(),
            'waypoint_distance': self.waypoint_distance,
            'armed': self.armed,
            'mode': self.mode,
            'vfr': self.vfr,
            'attitude': self.attitude,
            'is_ekf_ok': self.ekf_ok
        }

        return drone_info
    