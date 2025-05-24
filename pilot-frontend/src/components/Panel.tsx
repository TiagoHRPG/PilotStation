import React from 'react';
import './Panel.css';

export interface PanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'none' | 'small' | 'medium' | 'large';
  wrap?: boolean;
}

const Panel: React.FC<PanelProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'small',
  direction = 'column',
  align = 'stretch',
  justify = 'start',
  gap = 'medium',
  wrap = false,
}) => {
  return (
    <div
      className={`
        ui-panel
        ui-panel--${variant}
        ui-panel--padding-${padding}
        ui-panel--direction-${direction}
        ui-panel--align-${align}
        ui-panel--justify-${justify}
        ui-panel--gap-${gap}
        ${wrap ? 'ui-panel--wrap' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Panel;