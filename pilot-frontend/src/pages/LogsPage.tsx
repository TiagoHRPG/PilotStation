import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logService, LogFile } from '../services/logs';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './LogsPage.css';

export function LogsPage() {
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
  }, [selectedDrone]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await logService.getAvailableLogs(selectedDrone || undefined);
      console.log('Fetched logs:', response.data.logs);
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load flight logs');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLog = (filename: string) => {
    navigate(`/logs/${encodeURIComponent(filename)}`);
  };

  const handleDownloadLog = (filename: string) => {
    window.open(logService.getDownloadUrl(filename), '_blank');
  };

  const handleDeleteLog = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this log?')) {
      return;
    }

    try {
      await logService.deleteLog(filename);
      toast.success('Log deleted successfully');
      fetchLogs();
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error('Failed to delete log');
    }
  };

  // Get unique drone connection strings for filter
  const uniqueDrones = Array.from(new Set(logs.map(log => log.connection_string)));

  // Filter logs by search term and selected drone
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.connection_string.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Format file size for display
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format datetime for display
  const formatDateTime = (datetime: string): string => {
    const [date, time] = datetime.split('_');
    if (!date || !time) return datetime;
    
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);
    
    const hours = time.slice(0, 2);
    const minutes = time.slice(2, 4);
    const seconds = time.slice(4, 6);
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <Panel padding="medium" gap="medium" className="logs-page">
      <Panel direction="row" justify="between" align="center">
        <h3>Flight Logs</h3>
        <Button 
          variant="primary" 
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </Button>
      </Panel>
      
      <Panel direction="row" gap="medium" justify="between">
        <Input
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        
        <select 
          value={selectedDrone || ''} 
          onChange={(e) => setSelectedDrone(e.target.value || null)}
          className="drone-select"
        >
          <option value="">All Drones</option>
          {uniqueDrones.map(drone => (
            <option key={drone} value={drone}>{drone}</option>
          ))}
        </select>
        
        <Button 
          variant="primary" 
          onClick={fetchLogs}
          isLoading={loading}
        >
          Refresh
        </Button>
      </Panel>
      
      {loading ? (
        <div className="loading-container">Loading logs...</div>
      ) : (
        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Connection String</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="no-logs">No logs found</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.filename}>
                    <td>{formatDateTime(log.datetime)}</td>
                    <td>{log.connection_string}</td>
                    <td>{formatSize(log.size_bytes)}</td>
                    <td>
                      <Panel direction="row" gap="small">
                        <Button 
                          variant="primary" 
                          size="small"
                          onClick={() => handleViewLog(log.filename)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="small"
                          onClick={() => handleDownloadLog(log.filename)}
                        >
                          Download
                        </Button>
                        <Button 
                          variant="danger" 
                          size="small"
                          onClick={() => handleDeleteLog(log.filename)}
                        >
                          Delete
                        </Button>
                      </Panel>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}