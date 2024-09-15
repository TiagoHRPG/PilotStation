import React from 'react';

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
    <div className="mode-selector">
      <select
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
      <button onClick={handleModeChange}>Change Mode</button>
    </div>
  );
};

export default ModeSelector;