from dataclasses import dataclass, asdict

@dataclass
class Point:
    x: float
    y: float
    z: float
    
    def to_dict(self):
        return asdict(self)
