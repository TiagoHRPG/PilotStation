import threading
from fastapi import APIRouter, HTTPException
import time
import parameter_retrieval
import exceptions
from drone import Drone

class App:
    def _read_mavlink(self):
        while True:
            time.sleep(1/4000)
            msg = None

            for drone in self.drones.values():
                if drone.connected and drone.drone_parameters.param_count() != 0:
                    try:
                        msg = drone.connection.recv_match()
                        if msg is not None:
                            drone.update_info(msg) 
                    except:
                        pass
                        

    def __init__(self):
        self.drones: dict[str, Drone] = {}
        self.drones_lock = threading.Lock()
        self.router = APIRouter()
        threading.Thread(target=self._read_mavlink).start()

        self.router.add_api_route(
            path="/connect/{connection_string}",
            endpoint=self.connect,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/{connection_string}/arm",
            endpoint=self.arm,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/{connection_string}/takeoff/{height}",
            endpoint=self.takeoff,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/{connection_string}/land",
            endpoint=self.land,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/{connection_string}/modes",
            endpoint=self.get_available_modes,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/{connection_string}/set_mode/{mode}",
            endpoint=self.set_mode,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/{connection_string}/set_parameter/{param_id}/{value}",
            endpoint=self.set_parameter,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/{connection_string}/drone_info",
            endpoint=self.drone_info,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/{connection_string}/drones_info",
            endpoint=self.drones_info,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/{connection_string}/drone_parameters",
            endpoint=self.drone_parameters,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/{connection_string}/disconnect",
            endpoint=self.disconnect,
            methods=["GET"]
        )

    def connect(self, connection_string: str):
        """
        Connects to the drone using the provided connection string.
        Args:
            connection_string (str): The connection string used to connect to the drone.
        Returns:
            dict: A dictionary containing a message indicating the connection status.
        Raises:
            HTTPException: If the drone is already connected or if the connection fails.
        """
        try:
            with self.drones_lock:
                if connection_string not in self.drones:
                    self.drones[connection_string] = Drone()
                self.drones[connection_string].connect(connection_string)
                self.drones[connection_string].drone_parameters.parameters, _ = parameter_retrieval.retrieve_all_params(self.drones[connection_string].connection)
        except exceptions.DroneAlreadyConnectedException as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                         "type": e.__class__.__name__})
        except Exception as e:
            self.drones.pop(connection_string)
            raise HTTPException(status_code=500, detail="Could not connect to drone")

        return {"message": "Connected to drone"}
    
    def disconnect(self, connection_string: str):
        with self.drones_lock:
            if self.drones.get(connection_string) is None:
                raise HTTPException(status_code=404, detail="Drone not connected")
            
            self.drones[connection_string].disconnect()
            self.drones.pop(connection_string)

    
    def arm(self, connection_string: str):
        try:
            with self.drones_lock:
                self.drones[connection_string].arm()
        except exceptions.DroneNotConnectedException as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                         "type": e.__class__.__name__})
        except exceptions.ACKTimeoutException as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                         "type": e.__class__.__name__})
        
        return {"message": "Arming"}
    
    def takeoff(self, connection_string: str, height: float):
        try:
            with self.drones_lock:
                self.drones[connection_string].takeoff(height)
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
            return HTTPException(status_code=500, detail="Unknown error")

        return {"message": "Taking off"}

    def land(self, connection_string: str):
        try:
            with self.drones_lock:
                self.drones[connection_string].land()
        except exceptions.DroneNotConnectedException as e:
            raise HTTPException(status_code=400, detail={"response": str(e), 
                                                         "type": e.__class__.__name__})
        except:
            raise HTTPException(status_code=401, detail="Unknown error")
        
        return {"message": "Landing"}
    
    def get_available_modes(self, connection_string: str):
        try:
            return self.drones[connection_string].get_available_modes()
        except exceptions.DroneNotConnectedException as e:
            raise HTTPException(status_code=400, detail=str(e))
        except:
            raise HTTPException(status_code=500, detail="Unknown error")

    def set_mode(self, connection_string: str, mode: str):
        try:
            self.drones[connection_string].set_mode(mode)
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
        
        return {"message": f"Setting mode to {mode}"}
    
    def set_parameter(self, connection_string: str, param_id: str, value: float):
        self.drones[connection_string].set_parameter(param_id, value)

        return {"message": f"Setting parameter {param_id} to {value}"}

    def drone_info(self, connection_string: str):
        if connection_string not in self.drones:
            raise HTTPException(status_code=400, detail="Drone not connected")
        return self.drones[connection_string].get_drone_info()
    
    def drones_info(self):
        drones_info = {}
        for connection_string in self.drones.keys():
            drones_info[connection_string] = self.drones[connection_string].get_drone_info()
        return self.drones[connection_string].get_drone_info()

    def drone_parameters(self, drone_id: str):
        return self.drones[drone_id].get_all_parameters()
    
application = App()

router = application.router
