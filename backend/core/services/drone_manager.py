# core/services/drone_manager.py
import threading
import time
from typing import Dict
from core.models.drone import Drone
import core.parameters.parameter_retrieval as parameter_retrieval

READ_FREQUENCY = 4000  # Hz

class DroneManager:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(DroneManager, cls).__new__(cls)
                cls._instance.drones = {}
                cls._instance._initiate_mavlink_thread()
            return cls._instance
    
    def _initiate_mavlink_thread(self):
        """Inicia a thread que lê as mensagens MAVLink de todos os drones"""
        self._stop_thread = False
        self._mavlink_thread = threading.Thread(target=self._read_mavlink)
        self._mavlink_thread.daemon = True
        self._mavlink_thread.start()
    
    def _read_mavlink(self):
        """Thread que lê continuamente as mensagens MAVLink de todos os drones"""
        while not self._stop_thread:
            time.sleep(1 / READ_FREQUENCY)
            
            with self._lock:
                drone_list = list(self.drones.values())
            
            for drone in drone_list:
                if drone.connected and drone.drone_parameters.param_count() != 0:
                    try:
                        msg = drone.connection.recv_match()
                        if msg is not None:
                            drone.update_info(msg)
                    except:
                        pass  # Ignorar erros na leitura de mensagens
    
    def get_drone(self, connection_string: str) -> Drone:
        """Obtém um drone pelo connection_string, ou None se não existir"""
        with self._lock:
            return self.drones.get(connection_string)
    
    def add_drone(self, connection_string: str) -> Drone:
        """Adiciona um novo drone à coleção"""
        with self._lock:
            if connection_string not in self.drones:
                self.drones[connection_string] = Drone()
            return self.drones[connection_string]
    
    def remove_drone(self, connection_string: str) -> bool:
        """Remove um drone da coleção"""
        with self._lock:
            if connection_string in self.drones:
                self.drones.pop(connection_string)
                return True
            return False
    
    def get_all_drones_info(self) -> Dict:
        """Retorna informações de todos os drones conectados"""
        drones_info = {}
        with self._lock:
            for connection_string, drone in self.drones.items():
                drones_info[connection_string] = drone.get_drone_info()
        return drones_info
    
    def connect_drone(self, connection_string: str):
        """Conecta a um drone e carrega seus parâmetros"""
        drone = self.add_drone(connection_string)
        try:
            drone.connect(connection_string)
            drone.drone_parameters.parameters, _ = parameter_retrieval.retrieve_all_params(drone.connection)
        except Exception as e:
            self.remove_drone(connection_string)
            raise e