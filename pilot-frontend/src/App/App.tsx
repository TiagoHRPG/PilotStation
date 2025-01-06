import { useEffect, useState } from "react";
import "./App.css";
import DroneCard from "../components/DroneCard";
import baseUrl from "../api/api";
import { toast } from "react-toastify";
import WorldMap from "../components/WorldMap";
import { Drone } from "../components/DronesContext";
import { v4 as uuid } from "uuid";
import AddDroneForm from "../components/AddDroneForm";
import { ExceptionTypes } from "../enumerators/exceptionTypes";

function App() {
  const [drones, setDrones] = useState<Drone[]>([]);

  const removeDrone = (id: string) => {
    setDrones(drones.filter((drone) => drone.id !== id));
  }

  const connectDrone = (connectionString: string) =>  {
    
    fetch(`${baseUrl}/connect/${connectionString}`)
      .then(async (response) => {
        const data = await response.json();
        
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
          return { ...d, info: data };
        }
        return d;
      }));
    } 
    catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
      const interval = setInterval(() => {
        drones.forEach(async (drone) => {
          fetchDroneInfo(drone); 
        });
      }, 300);
      return () => clearInterval(interval);
  }, [drones]);

  const disconnectDrone = async (id: string) => {
    var response = await fetch(`${baseUrl}/${id}/disconnect`);
    
    if (response.status != 200) {
      toast.error("Error disconnecting from drone");
      return;
    }
    removeDrone(id);
  };

  return (
    <div className="app-container">
      <AddDroneForm onAddDrone={connectDrone}/>
      <div className="drone-cards-container">
        {drones.map((drone) => (
          <DroneCard key={drone.id} drone={drone} removeDrone={disconnectDrone}/>
        ))}
      </div>
      <WorldMap drones={drones} />
    </div>
  );
}

export default App;
