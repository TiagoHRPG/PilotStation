import axios from 'axios';

export const API_BASE_URL = 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptores de resposta para tratamento de erros uniforme
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento global de erros
    return Promise.reject(error);
  }
);