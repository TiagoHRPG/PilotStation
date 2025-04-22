class DroneParameters:
    def __init__(self):
        self.parameters : dict = dict()

    def update(self, msg):
        self.parameters[msg.param_id] = msg.param_value

    def param_count(self):
        return len(self.parameters)

    def __dict__(self):
        return self.parameters
    