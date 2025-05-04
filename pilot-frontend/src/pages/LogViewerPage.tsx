import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logService, LogEntry } from '../services/logs';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './LogViewerPage.css';
import Select from '../components/ui/Select';

export function LogViewerPage() {
  const { filename } = useParams<{ filename: string }>();
  const navigate = useNavigate();
  
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [truncated, setTruncated] = useState(false);
  const [maxEntries, setMaxEntries] = useState(1000);

  useEffect(() => {
    if (!filename) return;
    
    fetchLogContent(decodeURIComponent(filename));
  }, [filename, maxEntries]);

  const fetchLogContent = async (logFilename: string) => {
    try {
      setLoading(true);
      const response = await logService.getLogContent(logFilename, maxEntries);
      setLogEntries(response.data.entries);
      setTruncated(response.data.truncated);
    } catch (error) {
      console.error('Error fetching log content:', error);
      toast.error('Failed to load log content');
    } finally {
      setLoading(false);
    }
  };

  // Get unique event types for filter
  const uniqueEventTypes = Array.from(new Set(logEntries.map(entry => entry.event_type)));

  const filteredEntries = logEntries.filter(entry => {
    const matchesSearch = JSON.stringify(entry).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEventType = !eventTypeFilter || entry.event_type === eventTypeFilter;

    return matchesSearch && matchesEventType;
  });

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  const renderJson = (data: any): JSX.Element => {
    return (
      <pre className="json-data">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <Panel padding="medium" gap="medium" className="log-viewer-page">
      <Panel direction="row" justify="between" align="center">
        <h3>Log Viewer: {filename}</h3>
        <Button variant="primary" onClick={() => navigate('/logs')}>
          Back to Logs
        </Button>
      </Panel>
      
      <Panel direction="row" gap="medium" justify="between">
        <Input
          placeholder="Search log entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth={true}
        />
        
        <Select 
          value={eventTypeFilter} 
          variant='filled'
          options={uniqueEventTypes.map(type => ({ value: type, label: type }))}
          onChange={(e) => setEventTypeFilter(e.target.value)} />
        
        <Select
          value={maxEntries}
          options={[
            { value: 100, label: '100 entries' },
            { value: 500, label: '500 entries' },
            { value: 1000, label: '1000 entries' },
            { value: 5000, label: '5000 entries' },
            { value: 10000, label: '10000 entries' },
          ]}
          style={{minWidth: '150px'}}
          onChange={(e) => setMaxEntries(Number(e.target.value))}
          variant='filled'/>
      </Panel>
      
      {loading ? (
        <div className="loading-container">Loading log entries...</div>
      ) : (
        <>
          {truncated && (
            <div className="truncated-warning">
              <p color="warning">
                Note: Log file was truncated to {maxEntries} entries. Change the limit to view more entries.
              </p>
            </div>
          )}
          
          <Panel padding='none' gap='none' className="log-entries-container">
            {filteredEntries.length === 0 ? (
              <div className="no-entries">No matching log entries found</div>
            ) : (
              filteredEntries.map((entry, index) => (
                <Panel variant='filled' key={index} className="log-entry">
                  <Panel direction='row' justify='between'>
                    <span className="entry-timestamp">{formatTimestamp(entry.timestamp)}</span>
                    <span className="entry-type">{entry.event_type}</span>
                  </Panel>
                  <Panel className="entry-content">
                    {renderJson(entry.data)}
                  </Panel>
                </Panel>
              ))
            )}
          </Panel>
        </>
      )}
    </Panel>
  );
}