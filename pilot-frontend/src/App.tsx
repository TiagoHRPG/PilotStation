import DroneCard from "./drone/DroneCard";
import WorldMap from "./map/WorldMap";
import { useDronesStore } from "./store/dronesStore";
import AddDroneForm from "./drone/AddDroneForm";
import Panel from "./components/Panel";
import Button from "./components/Button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./DroneCardScroll.css"; 

function App() {
  const { drones, disconnectDrone } = useDronesStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnload = () => {
      drones.forEach(drone => {
        disconnectDrone(drone.connectionString);
      });
    };

    window.addEventListener('unload', handleUnload);
    
    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, []); 

  return (
    <Panel direction="column" gap="large" align="center">
      <Button 
        variant="secondary"
        onClick={() => navigate('/logs')}
      >
        View Flight Logs
      </Button>
      <Panel gap='medium' align="center">
        <AddDroneForm isFirstDrone={drones.length === 0}/>
        
        <div className="drone-cards-scrollable-container">
          <div className="drone-cards-scroll-area">
            {drones.map((drone) => (
              <DroneCard key={drone.connectionString} drone={drone}/>
            ))}
          </div>
        </div>
        
        <WorldMap drones={drones} />
      </Panel>
    </Panel>
  );
}

export default App;
