export interface ParamDefinition {
  name: string;
  displayName: string;
  description: string;
  unit?: string;
  range?: [number, number];
  values?: Record<string, string>;  // For dropdown options
  bitmask?: Record<string, string>; // For bitmask fields
}

/**
 * Parses the parameter definition JSON and returns a flattened map of parameter definitions
 */
export function parseParameterDefinitions(jsonData: any): Record<string, ParamDefinition> {
  const paramDefs: Record<string, ParamDefinition> = {};

  // First level - categories
  Object.entries(jsonData).forEach(([_, categoryParams]) => {
    if (!categoryParams || typeof categoryParams !== 'object') return;
    
    // Second level - parameters within category
    Object.entries(categoryParams as Record<string, any>).forEach(([paramName, paramDef]) => {
      if (!paramDef || typeof paramDef !== 'object') return;
      
      // Create parameter definition
      const fullParamName = paramName;
      paramDefs[fullParamName] = {
        name: fullParamName,
        displayName: paramDef.DisplayName || fullParamName,
        description: paramDef.Description || "No description available",
        unit: paramDef.Units,
        values: paramDef.Values,
        bitmask: paramDef.Bitmask
      };
      
      // Handle range if present
      if (paramDef.Range) {
        paramDefs[fullParamName].range = [
          parseFloat(paramDef.Range.low), 
          parseFloat(paramDef.Range.high)
        ];
      }
    });
  });

  return paramDefs;
}

export function getParameterUnit(paramName: string, paramDefs: Record<string, ParamDefinition>): string {
  const definition = paramDefs[paramName];
  return definition?.unit || "";
}

export function getParameterRange(paramName: string, paramDefs: Record<string, ParamDefinition>): [number, number] | undefined {
  const definition = paramDefs[paramName];
  return definition?.range;
}

export function getParameterDescription(paramName: string, paramDefs: Record<string, ParamDefinition>): string {
  const definition = paramDefs[paramName];
  return definition?.description || "No description available";
}

export function hasDropdownValues(paramName: string, paramDefs: Record<string, ParamDefinition>): boolean {
  const def = paramDefs[paramName];
  return !!def?.values && Object.keys(def.values).length > 0;
}

export function getDropdownOptions(paramName: string, paramDefs: Record<string, ParamDefinition>): { value: string, label: string }[] {
  const definition = paramDefs[paramName];
  if (!definition?.values) return [];
  
  return Object.entries(definition.values).map(([value, label]) => ({
    value,
    label: `${label} (${value})`
  }));
}

export function getDropdownDisplayValue(paramName: string, value: number | string, paramDefs: Record<string, ParamDefinition>): string {
  const definition = paramDefs[paramName];
  if (!definition?.values) return String(value);
  
  const stringValue = String(value);
  const label = definition.values[stringValue];
  return label ? `${label} (${stringValue})` : stringValue;
}