// components/chat/body/SeenIndicator.tsx
import React from 'react';

interface SeenIndicatorProps {
  status: 'sent' | 'delivered' | 'seen';
}

const SeenIndicator: React.FC<SeenIndicatorProps> = ({ status }) => {
  if (status === 'sent') {
    return (
      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }

  // Both delivered and seen use the double-tick, but 'seen' is colored blue
  return (
    <div className="relative flex">
      <svg className={`w-3.5 h-3.5 ${status === 'seen' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <svg className={`w-3.5 h-3.5 absolute -right-1.5 ${status === 'seen' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
};

export default SeenIndicator;