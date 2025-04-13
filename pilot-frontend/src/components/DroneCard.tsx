import React, { useEffect, useState } from 'react';
import baseUrl from '../api/api';
import { toast } from 'react-toastify';
import DroneInfoCard from './DroneInfoCard';
import { DroneInfo } from '../interfaces/DroneInfoInterface';
import ModeSelector from './ModeSelector';
import { nonArmableModes, notifyExceptions } from '../utilities';
import './DroneCard.css';
import { Drone } from '../contexts/DronesContext';
import { useNavigate } from 'react-router-dom';


interface DroneCardProps {
  drone: Drone;
  removeDrone: (connectionString: string) => void;
}

const DroneCard: React.FC<DroneCardProps> = ({ drone, removeDrone }) => {
  //const { drones, removeDrone } = useDroneContext();

  const navigate = useNavigate();

  const [modes, setModes] = useState<string[]>([]);
  const [info, setInfo] = useState(new DroneInfo());
  const [selectedMode, setSelectedMode] = useState('');


  function checkIfInArmableMode() {
        console.log(drone.info.mode);
        if (nonArmableModes.includes(info.mode)) {
            toast.error(`${info.mode} is not armable`);
            return false;
        }
        return true;
    }

  const handleRemoveCLick = async () => removeDrone(drone.connectionString)

  const handleArmClick = async () => {
	try {
		if (!checkIfInArmableMode()) return
	  	var response = await fetch(`${baseUrl}/${drone.connectionString}/arm`);
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
      var response = await fetch(`${baseUrl}/${drone.connectionString}/takeoff/1`);
      var responseJson: Record<string, string> = (await response.json())['detail'];
      notifyExceptions(response, responseJson);
	  } 
    catch (error) {
	    alert("Error while taking off");
	  }
  };

  const handleModeChange = async () => {
    try {
      const response = await fetch(`${baseUrl}/${drone.connectionString}/set_mode/${selectedMode}`);
      const responseJson = (await response.json())['detail'];
      notifyExceptions(response, responseJson);
      
      if (response.status == 200) {
        toast.success(`Mode changed to ${selectedMode}`);
      }
    } 
    catch (error) {
      toast.error(`Error changing mode: ${error}`);
    }
  };

  const fetchModes = async () => {
    try {
      const response = await fetch(`${baseUrl}/${drone.connectionString}/modes`);
      const data = await response.json();
      setModes(data.modes);
    } catch (error) {
      console.error('Error fetching modes:', error);
    }
  };

  const handleParametersClick = () => {
    navigate(`/drone/${drone.id}/parameters`);
  };

  useEffect(() => {
    fetchModes();
  }, []);

  useEffect(() => {
    setInfo(drone.info);
  }, [drone.info]);

  return (
    <div className="drone-card">
      <div className='connection-string-container'>
        <h3 className="connection-string">{drone?.connectionString}</h3>
        <button className="remove-button" onClick={handleRemoveCLick}>Remove</button>
      </div>
      <ModeSelector
          modes={modes}
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
          handleModeChange={handleModeChange}
      />
      <div className='drone-actions'>
        <button onClick={handleArmClick}>Arm</button>
        <button onClick={handleTakeoffClick}>Takeoff</button>
      </div>
      <DroneInfoCard info={info} />
      <button onClick={handleParametersClick}> Parameters</button>
    </div>
  );
};

export default DroneCard;