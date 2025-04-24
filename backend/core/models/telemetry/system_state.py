from pymavlink import mavutil

class SystemBaseMode:
    def __init__(self) -> None:
        self.stabilize_mode_enabled: bool = False
        self.auto_mode_enabled: bool = False
        self.manual_input_enabled: bool = False
    
    def update(self, base_mode: int) -> None:
        self.stabilize_mode_enabled = bool(base_mode & mavutil.mavlink.MAV_MODE_FLAG_STABILIZE_ENABLED)
        self.auto_mode_enabled = bool(base_mode & mavutil.mavlink.MAV_MODE_FLAG_AUTO_ENABLED)
        self.manual_input_enabled = bool(base_mode & mavutil.mavlink.MAV_MODE_FLAG_MANUAL_INPUT_ENABLED)
    
    def to_dict(self):
        return {
            'stabilize_mode_enabled': self.stabilize_mode_enabled,
            'auto_mode_enabled': self.auto_mode_enabled,
            'manual_input_enabled': self.manual_input_enabled
        }