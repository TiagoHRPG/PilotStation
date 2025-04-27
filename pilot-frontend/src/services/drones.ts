import { apiClient } from './client';

export const droneApi = {
    connect: (connectionString: string) => 
        apiClient.get(`/connect/${connectionString}`),

    disconnect: (connectionString: string) =>
        apiClient.get(`/${connectionString}/disconnect`),
  
    getDroneInfo: (connectionString: string) => 
        apiClient.get(`/${connectionString}/drone_info`),
  
    arm: (connectionString: string) => 
        apiClient.get(`/${connectionString}/arm`),
  
    takeoff: (connectionString: string, altitude: number) =>
        apiClient.get(`/${connectionString}/takeoff/${altitude}`),

    setMode: (connectionString: string, mode: string) =>
        apiClient.get(`/${connectionString}/set_mode/${mode}`),

    getModes: (connectionString: string) =>
        apiClient.get(`/${connectionString}/modes`),
}