import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DroneInfoCard from './DroneInfoCard';
import ModeSelector from './ModeSelector';
import { notArmableModes } from '../utils/constants';
import { notifyExceptions } from '../utils/exceptions';
import { Drone, useDronesStore } from '../store/droneStore';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Panel from './ui/Panel';
import { droneApi } from '../services/drones';


interface DroneCardProps {
  drone: Drone;
}

const DroneCard: React.FC<DroneCardProps> = ({ drone }) => {
  const { disconnectDrone } = useDronesStore();

  const navigate = useNavigate();

  const [modes, setModes] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState('');


  function checkIfInArmableMode() {
        if (notArmableModes.includes(drone.info.mode)) {
            toast.error(`${drone.info.mode} is not armable`);
            return false;
        }
        return true;
    }

  const handleRemoveClick = async () => disconnectDrone(drone.connectionString)

  const handleArmClick = async () => {
	try {
		if (!checkIfInArmableMode()) return
	  const response = await droneApi.arm(drone.connectionString);
    const data = response.data;
		var responseJson: Record<string, string> = data['detail'];

		notifyExceptions(data, responseJson);
	  } catch (error) {
	  alert(`Error while arming: ${error}`);
	}
  };

  const handleTakeoffClick = async () => {
    try {
      if(!drone.info.armed){
        toast.error("Drone is not armed");
        return;
      }
      const response = await droneApi.takeoff(drone.connectionString, 1);
      const data = response.data;

      var responseJson: Record<string, string> = data['detail'];
      notifyExceptions(data, responseJson);
	  } 
    catch (error) {
	    alert("Error while taking off");
	  }
  };

  const handleModeChange = async () => {
    try {
      const response = await droneApi.setMode(drone.connectionString, selectedMode);
      var data = response.data;

      const responseJson = data['detail'];
      notifyExceptions(data, responseJson);
      
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
      const response = await droneApi.getModes(drone.connectionString);

      setModes(response.data.modes);
    } catch (error) {
      console.error('Error fetching modes:', error);
    }
  };

  const handleParametersClick = () => {
    navigate(`/drone/${drone.id}/parameters`);
  };

  useEffect(() => {
    fetchModes();
  }, [modes]);

  return (
    <Panel gap='medium' padding='medium' variant='filled'>
      <Panel direction='row' padding='none' align='center' justify='between'>
        <h3>{drone?.connectionString}</h3>
        <Button variant="danger" onClick={handleRemoveClick}>Remove</Button>
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
      <DroneInfoCard info={drone.info} />
      <Button variant="secondary" onClick={handleParametersClick}> Parameters</Button>
    </Panel>
  );
};

export default DroneCard;