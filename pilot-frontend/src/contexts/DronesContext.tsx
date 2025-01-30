import React, { createContext, useState, useContext } from 'react';
import { DroneInfo } from '../interfaces/DroneInfoInterface';
import { toast } from 'react-toastify';
import baseUrl from '../api/api';


// DEPRECATED???

export interface Drone {
  id: string;
  connectionString: string;
  info: DroneInfo;
  worldPosition: { x: number, y: number, z: number };
}

interface DroneContextProps {
  drones: Drone[];
  addDrone: (drone: Drone) => void;
  removeDrone: (id: string) => void;
  updateDroneInfo: (id: string, info: DroneInfo) => void;
}

const DroneContext = createContext<DroneContextProps>(
  {
    drones: [],
    addDrone: () => {},
    removeDrone: () => {},
    updateDroneInfo: () => {}
  }
);

export const DroneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drones, setDrones] = useState<Drone[]>([]);

  const addDrone = (drone: Drone) => {
    setDrones([...drones, drone]);
  };

  const removeDrone = async (id: string) => {
    var response = await fetch(`${baseUrl}/${id}/disconnect`);
    if (response.status != 200) {
      toast.error("Error disconnecting from drone");
      return;
    }

    //drones.splice(id, 1);
    setDrones(drones.filter((drone) => drone.id !== id));
  };

  const updateDroneInfo = (id: string, info: DroneInfo) => {
    //drones[id] = { ...drones[id], info };
    setDrones(drones.map((drone) => {
      if (drone.id === id) {
        return { ...drone, info };
      }
      return drone;
    }));
  };

  return (
    <DroneContext.Provider value={{ drones, addDrone, removeDrone, updateDroneInfo }}>
      {children}
    </DroneContext.Provider>
  );
};

export const useDroneContext = () => {
  const context = useContext(DroneContext);
  if (!context) {
    throw new Error('useDroneContext must be used within a DroneProvider');
  }
  return context;
};

