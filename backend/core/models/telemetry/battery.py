class BatteryStatus:
    def __init__(self, level: int = 0):
        self.level: int = level
    
    def update(self, msg) -> None:
        self.level = msg.level if hasattr(msg, 'level') else self.level
    
    def __dict__(self):
        return {'level': self.level}