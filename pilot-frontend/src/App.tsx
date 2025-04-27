import DroneCard from "./components/DroneCard";
import WorldMap from "./map/WorldMap";
import { useDronesStore } from "./store/droneStore";
import AddDroneForm from "./components/AddDroneForm";
import Panel from "./components/ui/Panel";

function App() {
  // TODO: ADD MAVLINK TERMINAL SUPPORT
  const { drones } = useDronesStore();
  return (
    <Panel gap='medium'>
      <AddDroneForm isFirstDrone={drones.length === 0}/>
      <Panel direction='row' justify="evenly">
        {drones.map((drone) => (
          <DroneCard key={drone.connectionString} drone={drone}/>
        ))}
      </Panel>
      <WorldMap drones={drones} />
    </Panel>
  );
}

export default App;
