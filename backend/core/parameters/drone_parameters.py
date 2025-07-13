class DroneParameters:
    def __init__(self):
        self.parameters : dict = dict()

    def update(self, msg):
        self.parameters[msg.param_id] = msg.param_value

    def param_count(self):
        return len(self.parameters)
    
    def get_parameter(self, param_id):
        if param_id in self.parameters:
            return self.parameters[param_id]
        else:
            raise KeyError(f"Parameter {param_id} not found.")

    def get_parameters(self):
        return self.parameters
    