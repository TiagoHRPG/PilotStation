from enum import Enum

class MavResult(Enum):
    ACCEPTED = 0
    DENIED = 2
    FAILED = 4
    IDLE = -1