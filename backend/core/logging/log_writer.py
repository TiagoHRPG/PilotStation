import os
import json
import gzip
from typing import Dict, Any
from datetime import datetime
import logging

class LogWriter:
    """Interface base para diferentes estratégias de escrita de logs"""
    
    def write_log(self, log_entry: Dict[str, Any]):
        """Escreve uma entrada de log"""
        pass
    
    def close(self):
        """Fecha o escritor de logs"""
        pass

class FileLogWriter(LogWriter):
    """Implementação que escreve logs em arquivos JSON"""
    
    def __init__(self, connection_string: str, session_id: str, compress: bool = True):
        self.connection_string = connection_string
        self.session_id = session_id
        self.compress = compress
        
        # Criar diretório de logs se não existir
        self.log_dir = os.path.join(os.getcwd(), "flight_logs")
        os.makedirs(self.log_dir, exist_ok=True)
        
        # Criar nome de arquivo baseado na data/hora e session_id
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_conn_str = connection_string.replace(':', '_').replace('/', '_')
        
        filename = f"{timestamp}_{safe_conn_str}_{session_id}.jsonl"
        if compress:
            filename += ".gz"
            
        self.log_path = os.path.join(self.log_dir, filename)
        
        # Usar compressão gzip se solicitado
        if compress:
            self.file = gzip.open(self.log_path, 'wt')
        else:
            self.file = open(self.log_path, 'w')
        
        logging.info(f"Flight log initialized at {self.log_path}")
    
    def write_log(self, log_entry: Dict[str, Any]):
        """Escreve uma entrada de log no arquivo"""
        try:
            # Escreve o objeto JSON seguido por uma quebra de linha (JSON Lines format)
            self.file.write(json.dumps(log_entry) + "\n")
            self.file.flush()
        except Exception as e:
            logging.error(f"Error writing to log file: {e}")
    
    def close(self):
        """Fecha o arquivo de log"""
        if self.file and not self.file.closed:
            self.file.close()
            logging.info(f"Flight log closed: {self.log_path}")