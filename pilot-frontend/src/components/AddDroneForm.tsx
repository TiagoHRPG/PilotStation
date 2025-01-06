import React, { useState } from 'react';
import './AddDroneForm.css';

interface AddDroneFormProps {
  onAddDrone: (connectionString: string) => void;
}

const AddDroneForm: React.FC<AddDroneFormProps> = ({ onAddDrone }) => {
  const [connectionString, setConnectionString] = useState('');

  const handleAddDrone = () => {
    if (connectionString.trim() === '') {
      return;
    }
    onAddDrone(connectionString);
    setConnectionString('');
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
      <button className="add-drone-button" onClick={handleAddDrone}>Add Drone</button>
    </div>
  );
};

export default AddDroneForm;