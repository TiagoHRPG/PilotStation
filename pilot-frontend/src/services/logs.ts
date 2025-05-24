import { apiClient } from './client';

export interface LogFile {
  filename: string;
  connection_string: string;
  session_id: string;
  datetime: string;
  size_bytes: number;
  compressed: boolean;
}

export interface LogEntry {
  timestamp: string;
  session_id: string;
  connection_string: string;
  event_type: string;
  data: any;
}

export interface LogContent {
  entries: LogEntry[];
  total: number;
  truncated: boolean;
}

export const logService = {
  getAvailableLogs: (connectionString?: string) => 
    apiClient.get(`/logs${connectionString ? `?connection_string=${connectionString}` : ''}`),
  
  getLogContent: (filename: string, maxEntries: number = 1000) => 
    apiClient.get(`/logs/${filename}?max_entries=${maxEntries}`),
  
  deleteLog: (filename: string) => 
    apiClient.delete(`/logs/${filename}`),
  
  getDownloadUrl: (filename: string) => 
    `${apiClient.defaults.baseURL}/logs/download/${filename}`
};