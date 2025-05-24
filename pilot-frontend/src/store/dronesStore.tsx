import { create } from 'zustand';
import { toast } from 'react-toastify';
import { v4 as uuid } from 'uuid';
import { DroneInfo } from '../interfaces/DroneInfoInterface';
import { ExceptionTypes } from '../enumerators/exceptionTypes';
import { droneApi } from '../services/drones';
import { AxiosResponse } from 'axios';

const POLLING_INTERVAL = 300; 

export interface Drone {
  id: string;
  connectionString: string;
  info: DroneInfo;
  worldPosition: { x: number, y: number, z: number };
}

interface DronesState {
  drones: Drone[];
  isConnecting: boolean;
  connectDrone: (connectionString: string, initialPosition: { x: number; y: number; z: number }) => Promise<void>;
  disconnectDrone: (connectionString: string) => Promise<void>;
  armDrone: (connectionString: string) => Promise<AxiosResponse<any>>;
  takeoffDrone: (connectionString: string, altitude: number) => Promise<AxiosResponse<any>>;
  getDroneModes: (connectionString: string) => Promise<AxiosResponse<any>>;
  setDroneMode: (connectionString: string, mode: string) => Promise<AxiosResponse<any>>;
  updateDroneInfo: (drone: Drone) => void;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useDronesStore = create<DronesState>((set, get) => {
  let pollingInterval: number | null = null;
  
  const fetchDroneInfo = async (drone: Drone) => {
    try {
      const response = await droneApi.getDroneInfo(drone.connectionString);

      if (response.status === 404) {
        set(state => ({
          drones: state.drones.filter(d => d.id !== drone.id)
        }));
        toast.error("Drone connection lost");
      }
      if (response.statusText != 'OK') return;
      
      const data = await response.data;
      
      const positionDelta = {
        x: data.position.x - drone.info.position.x,
        y: data.position.y - drone.info.position.y,
        z: data.position.z - drone.info.position.z
      };
      
      const updatedDrone = {
        ...drone,
        info: data,
        worldPosition: {
          x: drone.worldPosition.x + positionDelta.x,
          y: drone.worldPosition.y + positionDelta.y,
          z: drone.worldPosition.z + positionDelta.z
        }
      };
      
      // Atualiza apenas o drone específico
      set(state => ({
        drones: state.drones.map(d => 
          d.id === drone.id ? updatedDrone : d
        )
      }));
    } catch (error) {
      console.error(`Error updating drone info for ${drone.connectionString}:`, error);
    }
  };
  
  return {
    drones: [],
    isConnecting: false,
    
    connectDrone: async (connectionString, initialPosition) => {
      set({ isConnecting: true });
      
      try {
        const response = await droneApi.connect(connectionString);
        const data = await response.data;
        
        if (response.status != 200 && data.detail.type != ExceptionTypes.DroneAlreadyConnectedException) {
          toast.error("Error connecting to drone");
          return;
        } 
        
        const drones = get().drones;
        if (drones.some(d => d.connectionString === connectionString)) {
          toast.warning("Drone already connected");
          return;
        }
        
        const newDrone: Drone = {
          id: uuid(),
          connectionString,
          info: {
            armed: false,
            mode: "",
            position: { x: 0, y: 0, z: 0 },
            battery_level: 0,
            waypoint_distance: 0,
            vfr: { airspeed: 0, groundspeed: 0, heading: 0, throttle: 0, altitude: 0, climb: 0 },
            attitude: { pitch: 0, roll: 0, yaw: 0 },
            is_ekf_ok: false
          },
          worldPosition: initialPosition
        };
        
        set(state => ({ drones: [...state.drones, newDrone] }));
        toast.success("Connected to drone");
        
        if (get().drones.length === 1) {
          get().startPolling();
        }
      } catch (error) {
        toast.error("Error connecting to drone");
      } finally {
        set({ isConnecting: false });
      }
    },
    
    disconnectDrone: async (connectionString) => {
      try {
        await droneApi.disconnect(connectionString);

        set(state => ({
          drones: state.drones.filter(d => d.connectionString !== connectionString)
        }));
        
        toast.success("Drone disconnected");
        
        // Parar polling se não houver mais drones
        if (get().drones.length === 0) {
          get().stopPolling();
        }
      } catch (error) {
        toast.error("Error disconnecting drone");
      }
    },

    armDrone: async (connectionString) => {
      return await droneApi.arm(connectionString);
    },    

    takeoffDrone: async (connectionString, altitude) => {
        return await droneApi.takeoff(connectionString, altitude);
    },

    getDroneModes: async (connectionString) => {
      return await droneApi.getModes(connectionString);
    },

    setDroneMode: async (connectionString, mode) => {
      return await droneApi.setMode(connectionString, mode);
    },
    
    updateDroneInfo: (drone) => {
      fetchDroneInfo(drone);
    },
    
    startPolling: () => {
      if (pollingInterval) return;
      
      pollingInterval = setInterval(() => {
        const { drones } = get();
        drones.forEach(drone => fetchDroneInfo(drone));
      }, POLLING_INTERVAL);
    },
    
    stopPolling: () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    }
  };
});

