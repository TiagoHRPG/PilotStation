import { useEffect, useState } from "react";
import "./App.css";
import DroneCard from "../components/DroneCard";
import baseUrl from "../api/api";
import { toast } from "react-toastify";
import WorldMap from "../components/WorldMap";
import { Drone } from "../contexts/DronesContext";
import { v4 as uuid } from "uuid";
import AddDroneForm from "../components/AddDroneForm";
import { ExceptionTypes } from "../enumerators/exceptionTypes";
import { SideBar } from "../components/SideBar";

function App() {
  // TODO: ADD MAVLINK TERMINAL SUPPORT
  const [drones, setDrones] = useState<Drone[]>(new Array<Drone>());

  const connectDrone = (connectionString: string, initialPosition: {x: number; y: number; z: number; }) =>  {
    
    fetch(`${baseUrl}/connect/${connectionString}`)
      .then(async (response) => {
        const data = await response.json();
        toast.success(data)
        
        if (response.status != 200 && data.detail.type != ExceptionTypes.DroneAlreadyConnectedException) {
          toast.error("Error connecting to drone");
          return;
        } 
        
        if (drones.some((drone) => drone.connectionString === connectionString)) {
          toast.warning("Drone already connected");
          return;
        }

        const newDrone: Drone = {
          id: uuid(),
          connectionString: connectionString,
          info: {
            armed: false,
            mode: "",
            position: { x: 0, y: 0, z: 0},
            battery_level: 0,
            waypoint_distance: 0,
            vfr: { airspeed: 0, groundspeed: 0, heading: 0, throttle: 0, altitude: 0, climb: 0 },
            attitude: { pitch: 0, roll: 0, yaw: 0 },
            is_ekf_ok: false
          },
          worldPosition: { x: initialPosition.x, y: initialPosition.y, z: initialPosition.z }
        }
        setDrones([...drones, newDrone]); 

        toast.success("Connected to drone");
      })
      .catch(() => {
        toast.error("Error connecting to drone");
      });
  };

  const fetchDroneInfo = async (drone: Drone) => {
    try {
      const response = await fetch(`${baseUrl}/${drone.connectionString}/drone_info`);
      const data = await response.json();
      setDrones(drones.map((d) => {
        if (d.id === drone.id) {
          const position_delta = { x: data.position.x - d.info.position.x, y: data.position.y - d.info.position.y, z: data.position.z - d.info.position.z };
          return { ...d, info: data, worldPosition: { x: d.worldPosition.x + position_delta.x, y: d.worldPosition.y + position_delta.y, z: d.worldPosition.z + position_delta.z } };  
        }
        return d;
      }));
    } 
    catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const disconnectDrone = async (id: string) => {
    var response = await fetch(`${baseUrl}/${id}/disconnect`);
    
    if (response.status != 200) {
      toast.error("Error disconnecting from drone");
      return;
    }
    removeDrone(id);
  };

  const removeDrone = (id: string) => {
    setDrones(drones.filter((drone) => drone.id !== id));
  }

  useEffect(() => {
      const interval = setInterval(() => {
        drones.forEach(async (drone) => {
          fetchDroneInfo(drone); 
        });
      }, 300);
      return () => clearInterval(interval);
  }, [drones]);

  return (
    <div className="App">
      <div className="main-interface">
        <AddDroneForm onAddDrone={connectDrone} isFirstDrone={drones.length === 0}/>
        <div className="drone-cards-container">
          {drones.map((drone) => (
            <DroneCard key={drone.id} drone={drone} removeDrone={disconnectDrone}/>
          ))}
        </div>
        <WorldMap drones={drones} />
      </div>
    </div>
    
  );
}

export default App;
