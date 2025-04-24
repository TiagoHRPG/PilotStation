import React, { useState } from 'react';
import './AddDroneForm.css';
import Button from './ui/Button';

interface AddDroneFormProps {
  onAddDrone: (connectionString: string, initialPosition: { x: number; y: number; z: number }) => void;
  isFirstDrone: boolean;
}

const AddDroneForm: React.FC<AddDroneFormProps> = ({ onAddDrone, isFirstDrone }) => {
  const [connectionString, setConnectionString] = useState('');
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0, z: 0 });

  const handleAddDrone = () => {
    if (connectionString.trim() === '') {
      return;
    }
    onAddDrone(connectionString, initialPosition);
    setConnectionString('');
    setInitialPosition({ x: 0, y: 0, z: 0 });
  };

  return (
    <div className="add-drone-container">
      <input
        type="text"
        value={connectionString}
        onChange={(e) => setConnectionString(e.target.value)}
        placeholder="Enter connection string"
        className="add-drone-input"
      />
      {!isFirstDrone && (
        <div className="initial-position-inputs">
          <input
            type="number"
            value={initialPosition.x}
            onChange={(e) => setInitialPosition({ ...initialPosition, x: parseFloat(e.target.value) })}
            placeholder="X"
            className="initial-position-input"
          />
          <input
            type="number"
            value={initialPosition.y}
            onChange={(e) => setInitialPosition({ ...initialPosition, y: parseFloat(e.target.value) })}
            placeholder="Y"
            className="initial-position-input"
          />
          <input
            type="number"
            value={initialPosition.z}
            onChange={(e) => setInitialPosition({ ...initialPosition, z: parseFloat(e.target.value) })}
            placeholder="Z"
            className="initial-position-input"
          />
        </div>
      )}
      <Button variant="primary" onClick={handleAddDrone}>Add Drone</Button>
    </div>
  );
};

export default AddDroneForm;