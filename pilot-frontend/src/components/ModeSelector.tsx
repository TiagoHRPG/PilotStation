import React, { useEffect, useState } from 'react';
import Button from './ui/Button';
import Panel from './ui/Panel';
import Select from './ui/Select';
import { notifyExceptions } from '../utils/exceptions';
import { toast } from 'react-toastify';
import { droneApi } from '../services/drones';

interface ModeSelectorProps {
  connectionString: string;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({
  connectionString
}) => {
  const [modes, setModes] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState('');

  const options = modes.map(mode => ({
    value: mode,
    label: mode
  }));

  

  const fetchModes = async () => {
    try {
      const response = await droneApi.getModes(connectionString);
  
      setModes(response.data.modes);
    } catch (error) {
      console.error('Error fetching modes:', error);
    }
  };

  const handleModeChange = async () => {
    try {
      const response = await droneApi.setMode(connectionString, selectedMode);
      var data = response.data;

      const responseJson = data['detail'];
      notifyExceptions(data, responseJson);
      
      if (response.status == 200) {
        toast.success(`Mode changed to ${selectedMode}`);
      }
    } 
    catch (error) {
      toast.error(`Error changing mode: ${error}`);
    }
  };

  useEffect(() => {
    fetchModes();
  }, [connectionString]);

  return (
    <Panel padding='none' direction="row" gap="medium" align='stretch' justify='between'> 
      <Select
        options={options}
        value={selectedMode}
        onChange={(e) => setSelectedMode(e.target.value)}
        placeholder="Select Mode"
        variant='filled'
        size='medium'
      />
      <Button size="small" variant="secondary" onClick={handleModeChange}>Change Mode</Button>
    </Panel>
  );
};

export default ModeSelector;