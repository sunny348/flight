import React from 'react';

const LoadingSpinner = ({ size = 'h-8 w-8', color = 'border-blue-500' }) => {
  return (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${color}`} />
  );
};

export default LoadingSpinner; 