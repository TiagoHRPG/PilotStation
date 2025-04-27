import React, { useEffect, useState } from 'react';
import baseUrl from '../api/api';
import { toast } from 'react-toastify';
import DroneInfoCard from './DroneInfoCard';
import { DroneInfo } from '../interfaces/DroneInfoInterface';
import ModeSelector from './ModeSelector';
import { notArmableModes } from '../utils/constants';
import { notifyExceptions } from '../utils/exceptions';
import { Drone } from '../contexts/DronesContext';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Panel from './ui/Panel';


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
        if (notArmableModes.includes(info.mode)) {
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
    <Panel gap='medium' padding='medium' variant='filled'>
      <Panel direction='row' padding='none' align='center' justify='between'>
        <h3>{drone?.connectionString}</h3>
        <Button variant="danger" onClick={handleRemoveCLick}>Remove</Button>
      </Panel>
      <ModeSelector
          modes={modes}
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
          handleModeChange={handleModeChange}
      />
      <Panel direction='row' align='stretch' justify='between' padding='none'>
        <Button variant="secondary" onClick={handleArmClick}>Arm</Button>
        <Button variant="secondary" onClick={handleTakeoffClick}>Takeoff</Button>
      </Panel>
      <DroneInfoCard info={info} />
      <Button variant="secondary" onClick={handleParametersClick}> Parameters</Button>
    </Panel>
  );
};

export default DroneCard;