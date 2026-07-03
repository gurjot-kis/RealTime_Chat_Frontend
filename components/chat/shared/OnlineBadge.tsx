// components/chat/shared/OnlineBadge.tsx
import React from 'react';

interface OnlineBadgeProps {
  isOnline: boolean;
  className?: string;
}

const OnlineBadge: React.FC<OnlineBadgeProps> = ({ isOnline, className = '' }) => {
  if (!isOnline) return null;

  return (
    <span 
      className={`bg-green-500 border-2 border-white dark:border-gray-900 rounded-full ${className}`} 
      aria-label="Online"
    />
  );
};

export default OnlineBadge;