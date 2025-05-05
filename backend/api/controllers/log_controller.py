import logging
import os
import json
import gzip
from fastapi import HTTPException
from typing import List, Dict, Any
from datetime import datetime
import glob

class LogController:
    def __init__(self):
        self.log_dir = os.path.join(os.getcwd(), "flight_logs")
        os.makedirs(self.log_dir, exist_ok=True)
    
    def get_available_logs(self, connection_string: str = None):
        """Obtém a lista de logs disponíveis"""
        print(f"Log directory: {self.log_dir}")
        log_files = glob.glob(os.path.join(self.log_dir, "*.jsonl.gz"))
        log_files.extend(glob.glob(os.path.join(self.log_dir, "*.jsonl")))
        
        logs = []
        for log_file in log_files:
            filename = os.path.basename(log_file)
            parts = filename.split('_')
            
            if len(parts) >= 3:
                date_str = parts[0]
                time_str = parts[1]
                
                # Extrair connection_string
                conn_str_parts = []
                for i in range(2, len(parts)-1):  # Último é o session_id com extensão
                    conn_str_parts.append(parts[i])
                    
                conn_str = "_".join(conn_str_parts)
                conn_str = conn_str.replace('_', ':')
                
                # Filtrar por connection_string se especificado
                if connection_string and connection_string != conn_str:
                    continue
                
                # Extrair session_id da última parte (remover extensão)
                session_id = parts[-1].split('.')[0]
                
                # Determinar tamanho do arquivo
                size_bytes = os.path.getsize(log_file)
                
                logs.append({
                    "filename": filename,
                    "connection_string": conn_str,
                    "session_id": session_id,
                    "datetime": f"{date_str}_{time_str}",
                    "size_bytes": size_bytes,
                    "compressed": filename.endswith(".gz")
                })
        
        # Ordenar por data/hora mais recente primeiro
        logs.sort(key=lambda x: x["datetime"], reverse=True)
        return {"logs": logs}
    
    def get_log_content(self, filename: str, max_entries: int = 1000):
        """Obtém o conteúdo de um arquivo de log"""
        file_path = os.path.join(self.log_dir, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Log file not found")
        
        try:
            entries = []
            is_compressed = filename.endswith(".gz")
            
            # Abrir o arquivo (comprimido ou não)
            with gzip.open(file_path, 'rt') if is_compressed else open(file_path, 'r') as file:
                for i, line in enumerate(file):
                    if i >= max_entries:
                        break
                    
                    entries.append(json.loads(line.strip()))
            
            return {"entries": entries, "total": len(entries), "truncated": len(entries) >= max_entries}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading log file: {str(e)}")
    
    def delete_log(self, filename: str):
        """Remove um arquivo de log"""
        file_path = os.path.join(self.log_dir, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Log file not found")
        
        try:
            os.remove(file_path)
            return {"message": f"Log file {filename} deleted successfully"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting log file: {str(e)}")