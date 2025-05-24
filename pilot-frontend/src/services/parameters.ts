import { apiClient } from './client';

export interface DroneParameter {
  name: string;
  value: number;
  unit?: string;
  range?: [number, number];
  description?: string;
}

export const parameterService = {
  getDroneParameters: (connectionString: string) => 
    apiClient.get(`/${connectionString}/drone_parameters`),
  
  setParameter: (connectionString: string, paramName: string, value: number) =>
    apiClient.get(`/${connectionString}/set_parameter/${paramName}/${value}`)
};