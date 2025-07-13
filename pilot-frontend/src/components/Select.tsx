import React, { forwardRef } from 'react';
import './Select.css';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  error?: string;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled';
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  error,
  size = 'medium',
  fullWidth = false,
  variant = 'outlined',
  placeholder,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`ui-select-container ${fullWidth ? 'ui-select--full-width' : ''} ${className}`}>
      <div className={`ui-select-wrapper ui-select--${variant} ui-select--${size} ${error ? 'ui-select--error' : ''}`}>
        <select
          ref={ref}
          id={selectId}
          className="ui-select"
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <div className="ui-select-error">{error}</div>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;