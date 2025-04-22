class VfrHud:
    def __init__(self):
        self.airspeed = 0
        self.groundspeed = 0
        self.heading = 0
        self.throttle = 0
        self.altitude = 0
        self.climb = 0
    
    def update(self, msg):
        self.airspeed = msg.airspeed
        self.groundspeed = msg.groundspeed
        self.heading = msg.heading
        self.throttle = msg.throttle
        self.altitude = msg.alt
        self.climb = msg.climb
    
    def __dict__(self):
        return {
            'airspeed': self.airspeed,
            'groundspeed': self.groundspeed,
            'heading': self.heading,
            'throttle': self.throttle,
            'altitude': self.altitude,
            'climb': self.climb
        }