from fastapi import APIRouter
from api.controllers.drone_controller import DroneController

router = APIRouter(tags=["drones"])
controller = DroneController()

@router.get("/connect/{connection_string}")
def connect(connection_string: str):
    """Conecta ao drone usando a string de conexão fornecida"""
    connection_string = connection_string.replace("+", "/")
    print(f"Connecting to drone with connection string: {connection_string}")
    return controller.connect(connection_string)

@router.get("/{connection_string}/arm")
def arm(connection_string: str):
    """Arma o drone"""
    connection_string = connection_string.replace("+", "/")
    return controller.arm(connection_string)

@router.get("/{connection_string}/takeoff/{height}")
def takeoff(connection_string: str, height: float):
    """Decola o drone para a altura especificada"""
    connection_string = connection_string.replace("+", "/")
    return controller.takeoff(connection_string, height)

@router.get("/{connection_string}/land")
def land(connection_string: str):
    """Pousa o drone"""
    connection_string = connection_string.replace("+", "/")
    return controller.land(connection_string)

@router.get("/{connection_string}/modes")
def get_available_modes(connection_string: str):
    """Obtém os modos de voos disponíveis"""
    connection_string = connection_string.replace("+", "/")
    return controller.get_available_modes(connection_string)

@router.get("/{connection_string}/set_mode/{mode}")
def set_mode(connection_string: str, mode: str):
    """Define o modo de voo do drone"""
    connection_string = connection_string.replace("+", "/")
    return controller.set_mode(connection_string, mode)

@router.get("/{connection_string}/set_parameter/{param_id}/{value}")
def set_parameter(connection_string: str, param_id: str, value: float):
    """Define um parâmetro do drone"""
    connection_string = connection_string.replace("+", "/")
    return controller.set_parameter(connection_string, param_id, value)

@router.get("/{connection_string}/drone_info")
def drone_info(connection_string: str):
    """Obtém informações sobre o drone"""
    connection_string = connection_string.replace("+", "/")
    return controller.get_drone_info(connection_string)

@router.get("/drones_info")
def drones_info():
    """Obtém informações sobre todos os drones conectados"""
    return controller.get_all_drones_info()

@router.get("/{connection_string}/drone_parameters")
def drone_parameters(connection_string: str):
    """Obtém todos os parâmetros do drone"""
    connection_string = connection_string.replace("+", "/")
    return controller.get_drone_parameters(connection_string)

@router.get("/{connection_string}/disconnect")
def disconnect(connection_string: str):
    """Desconecta do drone"""
    connection_string = connection_string.replace("+", "/")
    return controller.disconnect(connection_string)