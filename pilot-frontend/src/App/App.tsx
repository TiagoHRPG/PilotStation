import { useState, useEffect } from 'react';
import './App.css';

import baseUrl from '../api/api';
import DroneInfoCard from '../DroneInfoCard';
import { DroneInfo } from '../DroneInfoInterface';

function App() {
  const [info, setInfo] = useState(new DroneInfo());
  const [connectionString, setConnectionString] = useState('');
  const [modes, setModes] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState('');



  const fetchInfo = async (url: string) => {
	try {
	  const response = await fetch(`${baseUrl}${url}`);
	  const data = await response.json();
	  setInfo(prevInfo => {
		return {
		  ...prevInfo,
		  ...data
	}});
	} catch (error) {
	  console.error('Error fetching data:', error);
	}
  };

  const fetchModes = async () => {
    try {
      const response = await fetch(`${baseUrl}/modes`);
      const data = await response.json();
      setModes(data.modes);
    } catch (error) {
      console.error('Error fetching modes:', error);
    }
  };

  const handleModeChange = async () => {
    try {
      const response = await fetch(`${baseUrl}/set_mode/${selectedMode}`);
      const data = await response.json();
      console.log('Mode changed:', data);
    } catch (error) {
      console.error('Error changing mode:', error);
    }
  };

  const handleArmClick = async () => {
	try {
	  	var response = await fetch(`${baseUrl}/arm`);
		
	  console.log((await response.json()));
	} catch (error) {
	  alert(`Error while arming: ${error}`);
	}
  };

  const handleConnectClick = async () => {
	try{
		var response = await fetch(`${baseUrl}/connect/${connectionString}`);
		console.log((await response.json()));

		await fetchModes();
	}
	catch (error) {
		console.log(error);
	  	alert(`Connection failed`);
	}
	
  };

  const handleTakeoffClick = async () => {
	try {
		var response = await fetch(`${baseUrl}/takeoff/1`);

	  	console.log((await response.json()));
	} catch (error) {
	  alert("Error while taking off");
	}
  };

  useEffect(() => {
	const interval = setInterval(() => {
		fetchInfo('/drone_info');
	}, 1000); // Atualiza a cada 0.5 segundo

	return () => clearInterval(interval);
  }, []);

  return (
	<div className="container">
	  <div className="header">
		<button onClick={handleConnectClick}>Connect</button>
		<input
		  type="text"
		  value={connectionString}
		  onChange={(e) => setConnectionString(e.target.value)}
		  placeholder="Enter text"
		/>
	  </div>
	  <div>
		<button onClick={handleArmClick}>Arm</button>
		<button onClick={handleTakeoffClick}>Takeoff</button>
	  </div>
	  <div className="info">
	  	<DroneInfoCard info={info} />
	  </div>
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

	</div>
  );
}

export default App;