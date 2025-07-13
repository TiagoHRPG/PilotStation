import { apiClient } from './client';

export const droneApi = {
    connect: (connectionString: string) => {
        connectionString = connectionString.replace(/\//g, '+');
        return apiClient.get(`/connect/${connectionString}`);
    },

    disconnect: (connectionString: string) =>{
        connectionString = connectionString.replace(/\//g, '+');
        
        return apiClient.get(`/${connectionString}/disconnect`);
    },
  
    getDroneInfo: (connectionString: string) => {
        connectionString = connectionString.replace(/\//g, '+');
        return apiClient.get(`/${connectionString}/drone_info`);
    },
  
    arm: (connectionString: string) => {
        connectionString = connectionString.replace(/\//g, '+');
        
        return apiClient.get(`/${connectionString}/arm`);
    },
  
    takeoff: (connectionString: string, altitude: number) => {
        connectionString = connectionString.replace(/\//g, '+');

        return apiClient.get(`/${connectionString}/takeoff/${altitude}`);
    },
        
    setMode: (connectionString: string, mode: string) => {
        connectionString = connectionString.replace(/\//g, '+');
        return apiClient.get(`/${connectionString}/set_mode/${mode}`);
    },
        
    getModes: (connectionString: string) => {
        connectionString = connectionString.replace(/\//g, '+');
        return apiClient.get(`/${connectionString}/modes`);
    }
}