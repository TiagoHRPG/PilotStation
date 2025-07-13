class BatteryStatus:
    def __init__(self, level: int = 0):
        self.level: int = level
    
    def update(self, msg) -> None:
        self.level = msg.level if hasattr(msg, 'level') else self.level
    
    def to_dict(self):
        return {'level': self.level}