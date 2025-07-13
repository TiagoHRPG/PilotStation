from fastapi import HTTPException
from core.services.drone_manager import DroneManager
import utils.exceptions as exceptions

class DroneController:
    def __init__(self):
        self.drone_manager = DroneManager()
    
    def connect(self, connection_string: str):
        """Conecta ao drone usando a string de conexão fornecida"""
        try:
            self.drone_manager.connect_drone(connection_string)
            return {"message": "Connected to drone"}
        except Exception as e:
            raise HTTPException(status_code=500, detail="Could not connect to drone")
    
    def disconnect(self, connection_string: str):
        """Desconecta do drone"""
        drone = self.drone_manager.get_drone(connection_string)
        if drone is None:
            raise HTTPException(status_code=404, detail="Drone not connected")
        
        drone.disconnect()
        self.drone_manager.remove_drone(connection_string)
        return {"message": "Disconnected from drone"}
    
    def arm(self, connection_string: str):
        """Arma o drone"""
        drone = self.drone_manager.get_drone(connection_string)
        if drone is None:
            raise HTTPException(status_code=404, detail="Drone not connected")
        
        try:
            drone.arm()
            return {"message": "Arming"}
        except exceptions.DroneNotConnectedException as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                    "type": e.__class__.__name__})
        except exceptions.ACKTimeoutException as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                    "type": e.__class__.__name__})
        except exceptions.CommandFailedException as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                    "type": e.__class__.__name__})

    def takeoff(self, connection_string: str, height: float):
        """Decola o drone para a altura especificada"""
        drone = self.drone_manager.get_drone(connection_string)
        if drone is None:
            raise HTTPException(status_code=404, detail="Drone not connected")
        
        try:
            drone.takeoff(height)
            return {"message": "Taking off"}
        except exceptions.DroneNotConnectedException as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                    "type": e.__class__.__name__})
        except exceptions.ACKTimeoutException as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                    "type": e.__class__.__name__})
        except exceptions.CommandFailedException as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                    "type": e.__class__.__name__})
        except:
            raise HTTPException(status_code=500, detail="Unknown error")
    
    def land(self, connection_string: str):
        """Pousa o drone"""
        drone = self.drone_manager.get_drone(connection_string)
        if drone is None:
            raise HTTPException(status_code=404, detail="Drone not connected")
        
        try:
            drone.land()
            return {"message": "Landing"}
        except exceptions.DroneNotConnectedException as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                    "type": e.__class__.__name__})
        except:
            raise HTTPException(status_code=500, detail="Unknown error")
    
    def get_available_modes(self, connection_string: str):
        """Obtém os modos disponíveis para o drone"""
        drone = self.drone_manager.get_drone(connection_string)
        if drone is None:
            raise HTTPException(status_code=404, detail="Drone not connected")
        
        try:
            return drone.get_available_modes()
        except exceptions.DroneNotConnectedException as e:
            raise HTTPException(status_code=400, detail=str(e))
        except:
            raise HTTPException(status_code=500, detail="Unknown error")
    
    def set_mode(self, connection_string: str, mode: str):
        """Define o modo de operação do drone"""
        drone = self.drone_manager.get_drone(connection_string)
        if drone is None:
            raise HTTPException(status_code=404, detail="Drone not connected")
        
        try:
            drone.set_mode(mode)
            return {"message": f"Setting mode to {mode}"}
        except exceptions.DroneNotConnectedException as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                    "type": e.__class__.__name__})
        except exceptions.ACKTimeoutException as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                    "type": e.__class__.__name__})
        except exceptions.CommandFailedException as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                    "type": e.__class__.__name__})
        except ValueError as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                    "type": e.__class__.__name__})
        except:
            raise HTTPException(status_code=500, detail="Unknown error")
    
    def set_parameter(self, connection_string: str, param_id: str, value: float):
        """Define um parâmetro do drone"""
        drone = self.drone_manager.get_drone(connection_string)
        if drone is None:
            raise HTTPException(status_code=404, detail="Drone not connected")
        
        try:
            drone.set_parameter(param_id, value)
            return {"message": f"Setting parameter {param_id} to {value}"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    def get_drone_info(self, connection_string: str):
        """Obtém informações sobre o drone"""
        drone = self.drone_manager.get_drone(connection_string)
        if drone is None:
            raise HTTPException(status_code=404, detail="Drone not connected")
        
        return drone.get_drone_info()
    
    def get_all_drones_info(self):
        """Obtém informações sobre todos os drones conectados"""
        return self.drone_manager.get_all_drones_info()
    
    def get_drone_parameters(self, connection_string: str):
        """Obtém todos os parâmetros do drone"""
        drone = self.drone_manager.get_drone(connection_string)
        if drone is None:
            raise HTTPException(status_code=404, detail="Drone not connected")
        
        return drone.get_all_parameters()