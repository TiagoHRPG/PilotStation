from dataclasses import dataclass, asdict
from pymavlink import mavutil
from typing import Dict, Any

@dataclass
class EkfStatus:
    velocity_variance: float = 0
    pos_horiz_variance: float = 0
    pos_vert_variance: float = 0
    compass_variance: float = 0
    
    def update(self, msg) -> None:
        """Atualiza os valores do relatório EKF com base na mensagem recebida"""
        self.velocity_variance = msg.velocity_variance
        self.pos_horiz_variance = msg.pos_horiz_variance
        self.pos_vert_variance = msg.pos_vert_variance
        self.compass_variance = msg.compass_variance
    
    def __dict__(self) -> Dict[str, Any]:
        """Retorna um dicionário com os atributos da classe"""
        return asdict(self)
    
    def is_ekf_ok(self, msg) -> bool:
        """Verifica se o estado do EKF está OK com base nas flags da mensagem"""
        attitude_ok = bool(msg.flags & mavutil.mavlink.EKF_ATTITUDE)
        velocity_ok = bool(msg.flags & mavutil.mavlink.EKF_VELOCITY_HORIZ)
        velocity_vert_ok = bool(msg.flags & mavutil.mavlink.EKF_VELOCITY_VERT)
        pos_horiz_ok = bool(msg.flags & mavutil.mavlink.EKF_POS_HORIZ_REL)
        pred_pos_horiz_ok = bool(msg.flags & mavutil.mavlink.EKF_PRED_POS_HORIZ_REL)

        return attitude_ok and velocity_ok and velocity_vert_ok and pos_horiz_ok and pred_pos_horiz_ok