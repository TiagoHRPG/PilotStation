import axios from 'axios';

const getApiBaseUrl = (): string => {
  const hostname = window.location.hostname;
  const port = '8000'; 
  
  return `http://${hostname}:${port}`;
};

export const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);