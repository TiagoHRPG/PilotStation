from dataclasses import dataclass, asdict

@dataclass
class Point:
    x: float
    y: float
    z: float
    
    def __dict__(self):
        return asdict(self)
