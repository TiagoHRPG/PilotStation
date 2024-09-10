import threading
from fastapi import APIRouter, HTTPException
import serial
import exceptions
from drone import Drone


class App:
    def __init__(self):
        self.drone = Drone()
        self.router = APIRouter()

        self.router.add_api_route(
            path="/connect/{connection_string}",
            endpoint=self.connect,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/arm",
            endpoint=self.arm,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/takeoff/{height}",
            endpoint=self.takeoff,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/land",
            endpoint=self.land,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/modes",
            endpoint=self.get_available_modes,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/set_mode/{mode}",
            endpoint=self.set_mode,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/set_parameter/{param_id}/{value}",
            endpoint=self.set_parameter,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/drone_info",
            endpoint=self.drone_info,
            methods=["GET"]
        )

        self.router.add_api_route(
            path="/drone_parameters",
            endpoint=self.drone_parameters,
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
            self.drone.connect(connection_string)
            self.drone.run_message_receiver_threads()
        except exceptions.DroneAlreadyConnectedException as e:
            raise HTTPException(status_code=400, detail="Drone is already connected")
        except:
            raise HTTPException(status_code=400, detail="Could not connect to drone")

        return {"message": "Connected to drone"}
    
    def arm(self):
        # TODO: Handle arm in a non armable mode
        try:
            self.drone.arm()
        except exceptions.DroneNotConnectedException as e:
            raise HTTPException(status_code=422, detail="Drone is not connected")
        except exceptions.ACKTimeoutException as e:
            return HTTPException(status_code=400, detail=str(e))
        except:
            return HTTPException(status_code=401, detail="Unknown error")
        
        return {"message": "Arming"}
    
    def takeoff(self, height: float):
        # TODO: takeoff request while not armed
        try:
            self.drone.takeoff(height)
        except exceptions.DroneNotConnectedException as e:
            return HTTPException(status_code=400, detail=str(e))
        except exceptions.ACKTimeoutException as e:
            return HTTPException(status_code=400, detail=str(e))
        except:
            return HTTPException(status_code=401, detail="Unknown error")

        return {"message": "Taking off"}

    def land(self):
        try:
            self.drone.land()
        except exceptions.DroneNotConnectedException as e:
            return HTTPException(status_code=400, detail=str(e))
        except:
            return HTTPException(status_code=401, detail="Unknown error")
        
        return {"message": "Landing"}
    
    def get_available_modes(self):
        try:
            return self.drone.get_available_modes()
        except exceptions.DroneNotConnectedException as e:
            return HTTPException(status_code=400, detail=str(e))
        except:
            return HTTPException(status_code=401, detail="Unknown error")

    def set_mode(self, mode: str):
        try:
            self.drone.set_mode(mode)
        except exceptions.DroneNotConnectedException as e:
            return HTTPException(status_code=400, detail=str(e))
        except ValueError as e:
            return HTTPException(status_code=400, detail=str(e))
        except:
            return HTTPException(status_code=401, detail="Unknown error")
        
        return {"message": f"Setting mode to {mode}"}
    
    def set_parameter(self, param_id: str, value: float):
        self.drone.set_parameter(param_id, value)

        return {"message": f"Setting parameter {param_id} to {value}"}

    def drone_info(self):
        return self.drone.get_drone_info()

    def drone_parameters(self):
        return self.drone.get_all_parameters()
    
application = App()

router = application.router
