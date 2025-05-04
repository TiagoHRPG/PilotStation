import time
import json
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from .log_writer import LogWriter, FileLogWriter
import utils.exceptions as exceptions

class FlightLogger:
    """Gerenciador central de logs de voo"""
    
    def __init__(self, connection_string: str, writer: Optional[LogWriter] = None):
        self.connection_string = connection_string
        self.session_id = str(uuid.uuid4())
        self.start_time = datetime.now().isoformat()
        self.writer = writer or FileLogWriter(connection_string, self.session_id)
        
        # Registrar início da sessão de log
        self.log_event("SESSION_START", {
            "session_id": self.session_id,
            "connection_string": connection_string,
            "start_time": self.start_time
        })
    
    def log_command(self, command_name: str, params: Dict[str, Any], result: str, success: bool, error_type: str = None):
        """Registra um comando enviado ao drone e seu resultado"""
        self.log_event("COMMAND", {
            "name": command_name,
            "parameters": params,
            "result": result,
            "success": success,
            "error_type": error_type
        })
    
    def log_telemetry(self, telemetry_data: Dict[str, Any]):
        """Registra dados de telemetria periódicos do drone"""
        self.log_event("TELEMETRY", telemetry_data)
    
    def log_parameter_change(self, param_name: str, old_value: Any, new_value: Any, success: bool):
        """Registra alterações em parâmetros do drone"""
        self.log_event("PARAMETER_CHANGE", {
            "name": param_name,
            "old_value": old_value,
            "new_value": new_value,
            "success": success
        })
    
    def log_mode_change(self, old_mode: str, new_mode: str, success: bool):
        """Registra mudanças de modo de voo"""
        self.log_event("MODE_CHANGE", {
            "old_mode": old_mode,
            "new_mode": new_mode,
            "success": success
        })
    
    def log_connection_event(self, event_type: str, details: Dict[str, Any] = None):
        """Registra eventos de conexão/desconexão"""
        self.log_event(f"CONNECTION_{event_type}", details or {})
    
    def log_error(self, error_type: str, message: str, details: Dict[str, Any] = None):
        """Registra erros ocorridos durante o voo"""
        self.log_event("ERROR", {
            "type": error_type,
            "message": message,
            "details": details or {}
        })
    
    def log_event(self, event_type: str, data: Dict[str, Any]):
        """Método genérico para registrar qualquer tipo de evento"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "session_id": self.session_id,
            "connection_string": self.connection_string,
            "event_type": event_type,
            "data": data
        }
        
        self.writer.write_log(log_entry)
    
    def close(self):
        """Finaliza o logger, escrevendo evento de término de sessão"""
        self.log_event("SESSION_END", {
            "session_id": self.session_id,
            "end_time": datetime.now().isoformat(),
            "duration_seconds": (datetime.now() - datetime.fromisoformat(self.start_time)).total_seconds()
        })
        self.writer.close()