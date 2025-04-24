import React from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`ui-button ui-button--${variant} ui-button--${size} ${fullWidth ? 'ui-button--full-width' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="ui-button__spinner" />}
      {icon && <span className="ui-button__icon">{icon}</span>}
      <span className="ui-button__text">{children}</span>
    </button>
  );
};

export default Button;