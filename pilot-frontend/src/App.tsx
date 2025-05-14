import DroneCard from "./drone/DroneCard";
import WorldMap from "./map/WorldMap";
import { useDronesStore } from "./store/droneStore";
import AddDroneForm from "./drone/AddDroneForm";
import Panel from "./components/Panel";
import Button from "./components/Button";
import { useNavigate } from "react-router-dom";

function App() {
  const { drones, disconnectDrone } = useDronesStore();
  const navigate = useNavigate();

  window.addEventListener('unload', () => {
    drones.forEach(drone => {
      disconnectDrone(drone.connectionString);
    });
  });

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
