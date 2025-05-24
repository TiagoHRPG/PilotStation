import React, { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Panel from '../components/Panel';
import { useDronesStore } from '../store/droneStore';

interface AddDroneFormProps {
  isFirstDrone: boolean;
}

const AddDroneForm: React.FC<AddDroneFormProps> = ({ isFirstDrone }) => {
  const { connectDrone } = useDronesStore();
  const [connectionString, setConnectionString] = useState('');
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0, z: 0 });
  const [isConnecting, setIsConnecting] = useState(false);

  const handleAddDrone = async () => {
    if (connectionString.trim() === '') {
      return;
    }

    setIsConnecting(true);

    try {
      await connectDrone(connectionString, initialPosition);
      setConnectionString('');
      setInitialPosition({ x: 0, y: 0, z: 0 });
    } catch (error) {
      console.error('Failed to connect drone:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Panel gap="none" align="center">
      <Input
        label="Connection String"
        value={connectionString}
        onChange={(e) => setConnectionString(e.target.value)}
        placeholder="Enter connection string"
        fullWidth
        disabled={isConnecting}
        variant="outlined"
        size="medium"
      />
      {!isFirstDrone && (
        <Panel direction="row" gap="medium">
          <Input
            label="X Position"
            type="number"
            value={initialPosition.x.toString()}
            onChange={(e) => setInitialPosition({ ...initialPosition, x: parseFloat(e.target.value) || 0 })}
            placeholder="X"
            disabled={isConnecting}
            size="small"
          />
          <Input
            label="Y Position"
            type="number"
            value={initialPosition.y.toString()}
            onChange={(e) => setInitialPosition({ ...initialPosition, y: parseFloat(e.target.value) || 0 })}
            placeholder="Y"
            disabled={isConnecting}
            size="small"
          />
          <Input
            label="Z Position"
            type="number"
            value={initialPosition.z.toString()}
            onChange={(e) => setInitialPosition({ ...initialPosition, z: parseFloat(e.target.value) || 0 })}
            placeholder="Z"
            disabled={isConnecting}
            size="small"
          />
        </Panel>
      )}
      <Button 
        variant="primary" 
        onClick={handleAddDrone}
        isLoading={isConnecting}
        disabled={connectionString.trim() === '' || isConnecting}
      >
        {isConnecting ? 'Connecting...' : 'Add Drone'}
      </Button>
    </Panel>
  );
};

export default AddDroneForm;