import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 bg-slate-700 rounded' }) => {
  return <div className={`animate-pulse ${className}`} />;
};

export default Skeleton;