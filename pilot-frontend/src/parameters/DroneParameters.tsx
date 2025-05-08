import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDronesStore } from '../store/droneStore';
import { parameterService, DroneParameter } from '../services/parameters';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './DroneParameters.css';

interface ParameterTableItem extends DroneParameter {
    name: string;
    isEditing: boolean;
    originalValue: number;
    newValue?: number;
    hasChanged: boolean;
}

type ParameterDictionary = Record<string, ParameterTableItem>;

export function DroneParameters() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { drones } = useDronesStore();
  
  const [loading, setLoading] = useState(true);
  const [parameters, setParameters] = useState<ParameterDictionary>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Find the current drone from our store
  const drone = drones.find(d => d.id === id);

  async function fetchParameters() {
    try {
      setLoading(true);

      if (!drone) {
        toast.error("Drone not connected");
        return;
      }

      const response = await parameterService.getDroneParameters(drone.connectionString);
      console.log("Drone parameters response:", response);

      const paramDictionary: ParameterDictionary = {};
      Object.entries(response.data).forEach(([name, value]) => {
        paramDictionary[name] = {
          name,
          value: parseFloat(value as string),
          originalValue: parseFloat(value as string),
          isEditing: false,
          hasChanged: false,
          unit: getParameterUnit(name),
          range: getParameterRange(name),
          description: getParameterDescription(name),
        };
      });

      setParameters(paramDictionary);
    } catch (error) {
      console.error("Error fetching parameters:", error);
      toast.error("Failed to load drone parameters");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // If the drone isn't found, we can't continue
    if (!drone) {
      toast.error("Drone not found");
      return;
    }
    
    fetchParameters();
  }, []);

  // Helper functions to simulate metadata about parameters
  // In a real implementation, this would come from the backend
  function getParameterUnit(name: string): string {
    if (name.includes("ALT")) return "m";
    if (name.includes("SPEED")) return "m/s";
    if (name.includes("ANGLE") || name.includes("ANG")) return "deg";
    if (name.includes("RATE")) return "deg/s";
    return "";
  }
  
  function getParameterRange(name: string): [number, number] | undefined {
    if (name.includes("ALT")) return [0, 100];
    if (name.includes("SPEED")) return [0, 20];
    if (name.includes("ANGLE")) return [-180, 180];
    return undefined;
  }
  
  function getParameterDescription(name: string): string {
    const descriptions: Record<string, string> = {
      "WPNAV_SPEED": "Waypoint navigation speed",
      "PILOT_SPEED_UP": "Maximum climb rate",
      "PILOT_SPEED_DN": "Maximum descent rate",
      "FENCE_ALT_MAX": "Maximum altitude allowed by geofence",
      // Add more descriptions as needed
    };
    
    return descriptions[name] || "No description available";
  }

  const handleEditClick = (name: string) => {
    setParameters({
      ...parameters,
      [name]: {
        ...parameters[name],
        isEditing: true
      }
    })
  };

  const handleCancelEdit = (name: string) => {
    setParameters({
      ...parameters,
      [name]: {
        ...parameters[name],
        isEditing: false,
        newValue: undefined,
        hasChanged: false
      }
    });
  };

  const handleValueChange = (name: string, value: string) => {
    const numValue = parseFloat(value);
    const param = parameters[name];
    setParameters({
      ...parameters,
      [name]: {
        ...param,
        newValue: isNaN(numValue) ? undefined : numValue,
        hasChanged: !isNaN(numValue) && param.originalValue !== numValue
      }
    });
  };

  const handleSaveParameter = async (name: string) => {
    const param = parameters[name];

    if (param.newValue === undefined || !param.hasChanged) {
      return;
    }
    
    try {
      await parameterService.setParameter(
        drone!.connectionString, 
        name, 
        param.newValue
      );

      fetchParameters();
      
      toast.success(`Parameter ${param.name} updated to ${param.newValue}`);
    } catch (error) {
      console.error("Error updating parameter:", error);
      toast.error(`Failed to update parameter ${param.name}`);
    }
  };

  const handleSaveAll = async () => {
    //const changedParams = parameters.filter(p => p.hasChanged && p.newValue !== undefined);
    const changedParams = Object.values(parameters)
                                .filter(p => p.hasChanged && p.newValue !== undefined);

    if (changedParams.length === 0) {
      toast.info("No parameters to update");
      return;
    }
    
    setSaving(true);
    
    try {
      // Process each parameter one by one
      for (const param of changedParams) {
        await parameterService.setParameter(
          drone!.connectionString,
          param.name,
          param.newValue!
        );
      }
      
      // Update all parameters in state after successful save
      const updatedParameters = { ...parameters };
      
      changedParams.forEach(param => {
        updatedParameters[param.name] = {
          ...param,
          isEditing: false,
          value: param.newValue!,
          originalValue: param.newValue!,
          newValue: undefined,
          hasChanged: false
        };
      });
      
      setParameters(updatedParameters);
      toast.success(`Updated ${changedParams.length} parameters`);
    } catch (error) {
      console.error("Error updating parameters:", error);
      toast.error("Failed to update some parameters");
    } finally {
      setSaving(false);
    }
  };

  const filteredParameters = Object.values(parameters)
    .filter(param => param.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!drone) {
    return (
      <Panel padding="large">
        <h2>Drone Not Found</h2>
        <p>The drone you're looking for doesn't exist or is not connected.</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Return to Dashboard
        </Button>
      </Panel>
    );
  }

  const hasChangedParameters = Object.values(parameters).some(p => p.hasChanged);

  return (
    <Panel className="parameters-container" padding="medium" gap="medium">
      <Panel direction="row" justify="between" align="center">
        <h2>Parameters for Drone: {drone.connectionString}</h2>
        <Button variant="primary" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </Panel>
      
      <Panel direction="row" justify="between" align="center" gap="medium">
        <Input
          placeholder="Search parameters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        
        <Button 
          variant="success" 
          onClick={handleSaveAll} 
          disabled={saving || !hasChangedParameters}
          isLoading={saving}
        >
          Save All Changes
        </Button>
      </Panel>
      
      {loading ? (
        <div className="loading-container">Loading parameters...</div>
      ) : (
        <div className="parameters-table-container">
          <table className="parameters-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
                <th>Unit</th>
                <th>Range</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParameters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-parameters">No parameters found</td>
                </tr>
              ) : (
                filteredParameters.map(param => (
                  <tr key={param.name} className={param.hasChanged ? 'row-changed' : ''}>
                    <td>{param.name}</td>
                    <td>
                      {param.isEditing ? (
                        <Input
                          value={param.newValue !== undefined ? param.newValue.toString() : param.value.toString()}
                          onChange={(e) => handleValueChange(param.name, e.target.value)}
                          size="small"
                          type="number"
                          step="0.01"
                        />
                      ) : (
                        param.value.toFixed(2)
                      )}
                    </td>
                    <td>{param.unit || '-'}</td>
                    <td>
                      {param.range ? 
                        `${param.range[0]} to ${param.range[1]}` : 
                        '-'}
                    </td>
                    <td>{param.description || '-'}</td>
                    <td>
                      {param.isEditing ? (
                        <Panel direction="row" gap="small">
                          <Button 
                            variant="success" 
                            size="small"
                            onClick={() => handleSaveParameter(param.name)}
                            disabled={!param.hasChanged || param.newValue === undefined}
                          >
                            Save
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="small"
                            onClick={() => handleCancelEdit(param.name)}
                          >
                            Cancel
                          </Button>
                        </Panel>
                      ) : (
                        <Button 
                          variant="primary" 
                          size="small"
                          onClick={() => handleEditClick(param.name)}
                        >
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}