import React, { forwardRef } from 'react';
import './Input.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  size = 'medium',
  fullWidth = false,
  variant = 'outlined',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`ui-input-container ${fullWidth ? 'ui-input--full-width' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="ui-input-label">
          {label}
        </label>
      )}
      <div className={`ui-input-wrapper ui-input--${variant} ui-input--${size} ${error ? 'ui-input--error' : ''}`}>
        <input
          ref={ref}
          id={inputId}
          className="ui-input"
          {...props}
        />
      </div>
      {error && <div className="ui-input-error">{error}</div>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;