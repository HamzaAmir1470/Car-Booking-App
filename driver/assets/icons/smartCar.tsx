import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export const SmartCarIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Smart Signals / Connectivity Waves */}
      <path d="M12 2a4 4 0 0 1 4 4" />
      <path d="M12 5a1 1 0 0 1 1 1" />
      
      {/* Car Body */}
      <path d="M5 17h14a2 2 0 0 0 2-2v-3a2 2 0 0 0-1.6-1.96l-2.4-1.2A3 3 0 0 0 15.6 8H8.4a3 3 0 0 0-1.4.34L4.6 9.54A2 2 0 0 0 3 11.5V15a2 2 0 0 0 2 2z" />
      
      {/* Wheels */}
      <circle cx="7.5" cy="17.5" r="2.5" fill="currentColor" />
      <circle cx="16.5" cy="17.5" r="2.5" fill="currentColor" />
    </svg>
  );
};

export default SmartCarIcon;