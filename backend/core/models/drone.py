import queue
import time
import utils.exceptions as exceptions
from pymavlink import mavutil
import core.mavlink.mavlink_commands as mav
from core.models.geometry import Point
from core.models.enums import MavResult
from core.models.telemetry.battery import BatteryStatus
from core.models.telemetry.system_state import SystemBaseMode
from core.models.telemetry.vfr_hud import VfrHud
from core.models.telemetry.ekf_status import EkfStatus
from core.parameters.drone_parameters import DroneParameters

class Drone:
    def __init__(self):
        self.connection = None
        self.flight_logger = None

        self.system_base_mode = SystemBaseMode()
        self.connected = False

        self.message_queue = queue.Queue(100)

        self.position : Point = Point(0, 0, 0)  
        self.waypoint_distance = 0
        self._armed = False
        self.mode = 'STABILIZE'

        self.vfr = VfrHud()

        self.attitude = {
            'roll': 0,
            'pitch': 0,
            'yaw': 0
        }

        self.ekf_status_report = EkfStatus()
        self.ekf_ok = False
        
        self.battery_status = BatteryStatus(100)

        self.drone_parameters = DroneParameters()

        # commands ack
        self.armed_ack : MavResult = MavResult.IDLE
        self.takeoff_ack : MavResult = MavResult.IDLE
        self.set_mode_ack : MavResult = MavResult.IDLE        
    @property
    def armed(self):   
        return self._armed

    @armed.setter
    def armed(self, value: bool):
        self._armed = value

    def __is_armed(self, msg) -> bool:
        is_armed = bool(msg.base_mode & mavutil.mavlink.MAV_MODE_FLAG_SAFETY_ARMED)
        return is_armed

    def __is_heartbeat_from_quadrotor(self, msg):
        return msg.type == mavutil.mavlink.MAV_TYPE_QUADROTOR

    def update_info(self, msg):
        if msg.get_type() == 'LOCAL_POSITION_NED':
            self.position = Point(msg.x, msg.y, msg.z)
        elif msg.get_type() == 'NAV_CONTROLLER_OUTPUT':
            self.waypoint_distance = msg.wp_dist
        elif msg.get_type() == 'BATTERY_STATUS':
            self.battery_status.level = msg.battery_remaining
        elif msg.get_type() == 'HEARTBEAT' and self.__is_heartbeat_from_quadrotor(msg):
            self._armed = self.__is_armed(msg)
            self.system_base_mode.update(msg.base_mode)
        elif msg.get_type() == 'VFR_HUD':
            self.vfr.update(msg)
        elif msg.get_type() == 'ATTITUDE':
            self.attitude['roll'] = msg.roll
            self.attitude['pitch'] = msg.pitch
            self.attitude['yaw'] = msg.yaw
        elif msg.get_type() == 'EKF_STATUS_REPORT':
            self.ekf_status_report.update(msg)
            self.ekf_ok = self.ekf_status_report.is_ekf_ok(msg)
        elif msg.get_type() == 'COMMAND_ACK':
            if msg.command == mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM:
                self.armed_ack = MavResult(msg.result)
            elif msg.command == mavutil.mavlink.MAV_CMD_NAV_TAKEOFF:
                self.takeoff_ack =  MavResult(msg.result)
            elif msg.command == mavutil.mavlink.MAV_CMD_DO_SET_MODE:
                self.set_mode_ack = MavResult(msg.result)
        elif msg.get_type() == 'PARAM_VALUE':
            self.drone_parameters.update(msg)

        self.mode = self.connection.flightmode

        self.__log_telemetry(msg)

    def connect(self, connection_string: str = '') -> None:
        if self.connection is not None:
            raise exceptions.DroneAlreadyConnectedException()
        try:
            self.connection : mavutil.mavserial = mavutil.mavlink_connection(connection_string)
            heartbeat_response = self.connection.wait_heartbeat(timeout=3)
            if heartbeat_response is None:
                self.connection = None
                raise exceptions.ACKTimeoutException("Timeout waiting for heartbeat")
            
            self.connected = True
        except:
            raise

    def disconnect(self) -> None:
        if self.flight_logger:
            self.flight_logger.log_connection_event("DISCONNECTED")
            self.flight_logger.close()

        self.__check_connection()
    
        self.connection.close()
        self.connection = None
        self.connected = False

    def __wait_arm_ack(self, timeout: float = 0.5) -> None:
        start_time = time.time()
        while time.time() - start_time < timeout:
            if self.armed_ack == MavResult.ACCEPTED:
                self.armed_ack = MavResult.IDLE
                return
            elif self.armed_ack in [MavResult.FAILED, MavResult.DENIED]:
                self.armed_ack = MavResult.IDLE
                raise exceptions.CommandFailedException("Arming failed")
            time.sleep(0.1)

        raise exceptions.ACKTimeoutException("Timeout waiting for arming ACK")
    
    def __wait_takeoff_ack(self, timeout: float = 0.5) -> None:
        start_time = time.time()
        while time.time() - start_time < timeout:
            if self.takeoff_ack == MavResult.ACCEPTED:
                self.takeoff_ack = MavResult.IDLE
                return
            elif self.takeoff_ack in [MavResult.FAILED, MavResult.DENIED]:
                self.takeoff_ack = MavResult.IDLE
                raise exceptions.CommandFailedException("Takeoff failed")
            time.sleep(0.1)

        raise exceptions.ACKTimeoutException("Timeout waiting for takeoff ACK")

    def __wait_set_mode_ack(self, timeout: float = 0.5) -> None:
        start_time = time.time()
        while time.time() - start_time < timeout:
            if self.set_mode_ack == MavResult.ACCEPTED:
                self.set_mode_ack = MavResult.IDLE
                return True
            elif self.set_mode_ack in [MavResult.FAILED, MavResult.DENIED]:
                self.set_mode_ack = MavResult.IDLE
                return False
            time.sleep(0.1)

        raise exceptions.ACKTimeoutException("Timeout waiting for set mode ACK")

    def __wait_for_param_update(self, timeout: float = 0.5) -> None:
        start_time = time.time()   
        old_len_parameters = self.drone_parameters.param_count()
        while time.time() - start_time < timeout:
            if self.drone_parameters.param_count() > old_len_parameters:
                # reset timeout
                start_time = time.time()
                old_len_parameters = self.drone_parameters.param_count()
    
    def arm(self) -> None:
        self.__check_connection()

        self.armed_ack = MavResult.IDLE
        try:
            mav.arm(self.connection)
            self.__wait_arm_ack(0.5)
            
            if self.flight_logger is not None:
                self.flight_logger.log_command(
                    "ARM", 
                    {}, 
                    "SUCCESS", 
                    True
                )
                
            return True
        except exceptions.CommandFailedException as e:
            if self.flight_logger is not None:
                self.flight_logger.log_command(
                    "ARM", 
                    {}, 
                    "FAILED", 
                    False, 
                    error_type=e.__class__.__name__
                )
            raise e

    def takeoff(self, height: float) -> None:
        self.__check_connection()
        self.takeoff_ack = MavResult.IDLE
        
        try:
            mav.takeoff(self.connection, height)
            self.__wait_takeoff_ack(0.5)
            
            if self.flight_logger is not None:
                self.flight_logger.log_command(
                    "TAKEOFF", 
                    {"height": height}, 
                    "SUCCESS", 
                    True
                )
            return True
        
        except exceptions.CommandFailedException as e:
            if self.flight_logger:
                self.flight_logger.log_command(
                    "TAKEOFF", 
                    {}, 
                    "FAILED", 
                    False, 
                    error_type=e.__class__.__name__
                )
            raise e


    def land(self) -> None:
        self.__check_connection()
        mav.set_mode(self.connection, 'LAND')

    def get_available_modes(self) -> None:
        self.__check_connection()
        return {'modes': list(self.connection.mode_mapping().keys())}

    def set_mode(self, mode: str | int) -> None:
        self.__check_connection()
        
        try:
            mav.set_mode(self.connection, mode)

            if not self.__wait_set_mode_ack(0.5):
                raise exceptions.CommandFailedException(f"failed setting {mode} mode")
            
            if self.flight_logger:
                self.flight_logger.log_command(
                    "SET_MODE", 
                    {'mode': mode}, 
                    "SUCCESS", 
                    True
                )
        except exceptions.CommandFailedException as e:
            if self.flight_logger:
                self.flight_logger.log_command(
                    "SET_MODE", 
                    {'mode': mode}, 
                    "FAILED", 
                    False, 
                    error_type=e.__class__.__name__
                )
            raise e

    def get_all_parameters(self) -> dict:
        self.__check_connection()

        return self.drone_parameters.get_parameters()

    def set_parameter(self, param_id: str, value: float) -> None:
        self.__check_connection()

        self.connection.param_set_send(param_id, value)

        self.__wait_for_param_update(0.3)

        if self.flight_logger:
            self.flight_logger.log_parameter_change(
                param_id, 
                self.drone_parameters.get_parameter(param_id), 
                value, 
                True
            )


    def get_drone_info(self):
        drone_info = {
            'battery_level': self.battery_status.level,
            'position': self.position.to_dict(),
            'waypoint_distance': self.waypoint_distance,
            'armed': self.armed,
            'mode': self.mode,
            'vfr': self.vfr.to_dict(),
            'attitude': self.attitude,
            'is_ekf_ok': self.ekf_ok
        }

        return drone_info
    
    def __log_telemetry(self, msg):
        if self.flight_logger and msg.get_type() in ['LOCAL_POSITION_NED', 'VFR_HUD', 'BATTERY_STATUS', 'ATTITUDE']:
            # Registrar apenas alguns tipos de mensagens para não sobrecarregar os logs
            if hasattr(self, '_last_telemetry_log') and time.time() - self._last_telemetry_log < 1:
                # Limitar a 1 log por segundo
                return
                
            self._last_telemetry_log = time.time()
            
            self.flight_logger.log_telemetry({
                'position': self.position.to_dict() if hasattr(self, 'position') else None,
                'attitude': self.attitude if hasattr(self, 'attitude') else None,
                'vfr': self.vfr.to_dict() if hasattr(self, 'vfr') else None,
                'battery': self.battery_status.level if hasattr(self, 'battery_status') else None,
                'armed': self.armed,
                'mode': self.mode,
                'ekf_ok': self.ekf_ok if hasattr(self, 'ekf_ok') else None,
            })

    def __check_connection(self):
        if self.connection is None:
            raise exceptions.DroneNotConnectedException()