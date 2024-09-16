class DroneNotConnectedException(Exception):
    def __init__(self):
        super().__init__("Drone is not connected")

class ACKTimeoutException(Exception):
    def __init__(self, message: str):
        super().__init__(message)

class CommandFailedException(Exception):
    def __init__(self, message: str):
        super().__init__(message)

class DroneAlreadyConnectedException(Exception):
    def __init__(self):
        super().__init__("Drone is already connected")