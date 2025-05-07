import axios from 'axios';


// Função para determinar o IP base da API
const getApiBaseUrl = (): string => {
  // 2. Segunda prioridade: Detecção automática
  const hostname = window.location.hostname;
  const port = '8000'; // Porta da API backend
  
  return `http://${hostname}:${port}`;
};


export const API_BASE_URL = getApiBaseUrl();

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