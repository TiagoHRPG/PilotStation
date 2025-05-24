import DroneCard from "./drone/DroneCard";
import WorldMap from "./map/WorldMap";
import { useDronesStore } from "./store/dronesStore";
import AddDroneForm from "./drone/AddDroneForm";
import Panel from "./components/Panel";
import Button from "./components/Button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
      <Panel gap='medium'>
        <AddDroneForm isFirstDrone={drones.length === 0}/>
        <Panel direction='row' justify="evenly">
          {drones.map((drone) => (
            <DroneCard key={drone.connectionString} drone={drone}/>
          ))}
        </Panel>
        <WorldMap drones={drones} />
      </Panel>
    </Panel>
  );
}

export default App;
