import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export const SmallCardIcon: React.FC<IconProps> = ({
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
      {/* Compact/Small Card Frame */}
      <rect x="4" y="6" width="16" height="12" rx="2" ry="2" />
      
      {/* Magnetic Stripe / Card Accent */}
      <line x1="4" y1="10" x2="20" y2="10" />
      
      {/* Small Chip/Line detail */}
      <line x1="7" y1="14" x2="11" y2="14" />
    </svg>
  );
};

export default SmallCardIcon;