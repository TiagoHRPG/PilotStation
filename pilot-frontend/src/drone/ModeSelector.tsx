import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import Panel from '../components/Panel';
import Select from '../components/Select';
import { notifyExceptions } from '../utils/exceptions';
import { toast } from 'react-toastify';
import { useDronesStore } from '../store/dronesStore';

interface ModeSelectorProps {
  connectionString: string;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({
  connectionString
}) => {
  const [modes, setModes] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState('');
  const { getDroneModes, setDroneMode } = useDronesStore();

  const options = modes.map(mode => ({
    value: mode,
    label: mode
  }));

  

  const fetchModes = async () => {
    try {
      const response = await getDroneModes(connectionString);
      const data = await response.data;

      setModes(data.modes);
    } catch (error) {
      console.error('Error fetching modes:', error);
    }
  };

  const handleModeChange = async () => {
    try {
      if (!selectedMode) {
        toast.error("Please select a mode");
        return;
      }
      const response = await setDroneMode(connectionString, selectedMode);
      const data = await response.data;

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