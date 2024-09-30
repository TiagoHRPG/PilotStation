import { useState, useEffect } from 'react';
import './App.css';

import baseUrl from '../api/api';
import DroneInfoCard from '../components/DroneInfoCard';
import { DroneInfo } from '../interfaces/DroneInfoInterface';
import WorldMap from '../components/WorldMap';
import Header from '../components/Header';
import { convertNEDToXYZ, nonArmableModes, notifyExceptions } from '../utilities';
import ModeSelector from '../components/ModeSelector';
import { toast } from 'react-toastify';

function App() {
  const [info, setInfo] = useState(new DroneInfo());
  const [connectionString, setConnectionString] = useState('');
  const [modes, setModes] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState('');
  const [isConnected, setIsConnected] = useState(false);

	function checkIfInArmableMode() {
		console.log(info.mode);
		if (nonArmableModes.includes(info.mode)) {
			toast.error(`${info.mode} is not armable`);
			return false;
		}
		console.log("here")
		return true;
	}


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

  const handleConnectClick = async () => {
	try{
		var response = await fetch(`${baseUrl}/connect/${connectionString}`);
		var responseJson: Record<string, string> = (await response.json())['detail'];

		notifyExceptions(response, responseJson);
		if(response.status == 200){
			toast.success("Connected to drone");
			setIsConnected(true);
		}
		else if(responseJson?.type == "DroneAlreadyConnectedException"){
			setIsConnected(true);
		}

		await fetchModes();
	}
	catch (error) {
		console.log(error);
	  	alert(`Connection failed`);
	}
	
  };

  const handleModeChange = async () => {
    try {
		const response = await fetch(`${baseUrl}/set_mode/${selectedMode}`);
		const responseJson = (await response.json())['detail'];
		console.log(responseJson);
		notifyExceptions(response, responseJson);
		
		if (response.status == 200) {
			toast.success(`Mode changed to ${selectedMode}`);
		}
    } catch (error) {
      toast.error(`Error changing mode: ${error}`);
    }
  };

  const handleArmClick = async () => {
	try {
		if (!checkIfInArmableMode()) return
	  	var response = await fetch(`${baseUrl}/arm`);
		var responseJson: Record<string, string> = (await response.json())['detail'];
		notifyExceptions(response, responseJson);
	} catch (error) {
	  alert(`Error while arming: ${error}`);
	}
  };

  const handleTakeoffClick = async () => {
	try {
		if(!info.armed){
			toast.error("Drone is not armed");
			return;
		}
		var response = await fetch(`${baseUrl}/takeoff/1`);
		var responseJson: Record<string, string> = (await response.json())['detail'];
		notifyExceptions(response, responseJson);
	} catch (error) {
	  alert("Error while taking off");
	}
  };

  useEffect(() => {
	const interval = setInterval(() => {
		fetchInfo('/drone_info');
	
	}, 200); // Atualiza a cada 0.5 segundo

	return () => clearInterval(interval);
  }, []);

  return (
	<div className='container'>
		<Header
			connectionString={connectionString}
			setConnectionString={setConnectionString}
			handleConnectClick={handleConnectClick}
		/>
		<div>
			<button onClick={handleArmClick}>Arm</button>
			<button onClick={handleTakeoffClick}>Takeoff</button>
		</div>
		<ModeSelector
			modes={modes}
			selectedMode={selectedMode}
			setSelectedMode={setSelectedMode}
			handleModeChange={handleModeChange}
      	/>
		<DroneInfoCard info={info} />
		<WorldMap dronePosition={convertNEDToXYZ(info.position)}/>
	</div>
  );
}

export default App;
