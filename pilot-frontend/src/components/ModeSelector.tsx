import React from 'react';
import './ModeSelector.css';
import Button from './ui/Button';

interface ModeSelectorProps {
  modes: string[];
  selectedMode: string;
  setSelectedMode: (mode: string) => void;
  handleModeChange: () => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({
  modes,
  selectedMode,
  setSelectedMode,
  handleModeChange,
}) => {
  return (
    <div className="mode-selector-container">
      <select className="mode-selector-dropdown"
        value={selectedMode}
        onChange={(e) => setSelectedMode(e.target.value)}
      >
        <option value="" disabled>Select Mode</option>
        {modes.map((mode) => (
          <option key={mode} value={mode}>
            {mode}
          </option>
        ))}
      </select>
      <Button variant="secondary" onClick={handleModeChange}>Change Mode</Button>
    </div>
  );
};

export default ModeSelector;