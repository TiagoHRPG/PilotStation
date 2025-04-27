import React from 'react';
import Button from './ui/Button';
import Panel from './ui/Panel';
import Select from './ui/Select';

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
  if (modes == null){
    return <div>Loading...</div>;
  }
  const options = modes.map(mode => ({
    value: mode,
    label: mode
  }));

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