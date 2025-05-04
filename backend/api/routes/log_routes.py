import os
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from api.controllers.log_controller import LogController

router = APIRouter(tags=["logs"])
controller = LogController()

@router.get("/logs")
def get_available_logs(connection_string: str = None):
    """Obtém a lista de logs de voo disponíveis"""
    return controller.get_available_logs(connection_string)

@router.get("/logs/{filename}")
def get_log_content(filename: str, max_entries: int = Query(1000, gt=0, le=10000)):
    """Obtém o conteúdo de um arquivo de log"""
    return controller.get_log_content(filename, max_entries)

@router.delete("/logs/{filename}")
def delete_log(filename: str):
    """Remove um arquivo de log"""
    return controller.delete_log(filename)

@router.get("/logs/download/{filename}")
def download_log(filename: str):
    """Endpoint para download direto do arquivo de log"""
    file_path = os.path.join(controller.log_dir, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Log file not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream"
    )