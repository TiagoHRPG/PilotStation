import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDronesStore } from '../store/dronesStore';
import { parameterService, DroneParameter } from '../services/parameters';
import Panel from '../components/Panel';
import Button from '../components/Button';
import Input from '../components/Input';
import './DroneParameters.css';

import { 
  parseParameterDefinitions, 
  ParamDefinition,
  getParameterUnit,
  getParameterRange,
  getParameterDescription,
  hasDropdownValues,
  getDropdownOptions,
  getDropdownDisplayValue
} from '../services/parameterParser';

import paramDefinitions from '../assets/parameter_definitions.json';
import Select from '../components/Select';


interface ParameterTableItem extends DroneParameter {
    name: string;
    isEditing: boolean;
    originalValue: number;
    newValue?: number;
    hasChanged: boolean;
    hasDropdown?: boolean;
    dropdownOptions?: { value: string, label: string }[];
}

type ParameterDictionary = Record<string, ParameterTableItem>;

export function DroneParameters() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { drones } = useDronesStore();
  
  const [loading, setLoading] = useState(true);
  const [parameters, setParameters] = useState<ParameterDictionary>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [paramDefs, setParamDefs] = useState<Record<string, ParamDefinition>>({});

  // Find the current drone from our store
  const drone = drones.find(d => d.id === id);

  useEffect(() => {
    const parsedDefs = parseParameterDefinitions(paramDefinitions);
    setParamDefs(parsedDefs);
  }, []);

  async function fetchParameters() {
    try {
      setLoading(true);

      if (!drone) {
        toast.error("Drone not connected");
        return;
      }

      const response = await parameterService.getDroneParameters(drone.connectionString);
      console.log("here", paramDefs)
      const paramDictionary: ParameterDictionary = {};
      Object.entries(response.data).forEach(([name, value]) => {
        const numValue = parseFloat(value as string);
        const hasDropdown = hasDropdownValues(name, paramDefs);

        paramDictionary[name] = {
          name,
          value: numValue,
          originalValue: numValue,
          isEditing: false,
          hasChanged: false,
          unit: getParameterUnit(name, paramDefs),
          range: getParameterRange(name, paramDefs),
          description: getParameterDescription(name, paramDefs),
          hasDropdown, 
          dropdownOptions: hasDropdown ? getDropdownOptions(name, paramDefs) : undefined
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
    if (!drone) {
      toast.error("Drone not found");
      return;
    }
    
    fetchParameters();
  }, [paramDefs]);

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
    const numValue = parseFloat(value) | 0;
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

  const handleDropdownChange = (name: string, value: string) => {
    const param = parameters[name];
    const numValue = parseFloat(value);
    
    setParameters({
      ...parameters,
      [name]: {
        ...param,
        newValue: numValue,
        hasChanged: param.originalValue !== numValue
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
                        param.hasDropdown ? (
                          <Select
                            variant='filled'
                            options={param.dropdownOptions || []}
                            value={param.newValue !== undefined ? param.newValue.toString() : param.value.toString()}
                            onChange={(e) => handleDropdownChange(param.name, e.target.value)}
                            size="small"
                          />
                        ) : (
                          <Input
                            value={param.newValue !== undefined ? param.newValue.toString() : param.value.toString()}
                            onChange={(e) => handleValueChange(param.name, e.target.value)}
                            size="small"
                            type="number"
                            step="0.01"
                          />
                        )
                      ) : (
                        param.hasDropdown 
                          ? getDropdownDisplayValue(param.name, param.value, paramDefs)
                          : param.value.toFixed(2)
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