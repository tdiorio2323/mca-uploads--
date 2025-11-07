import React from 'react';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  message: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message, action }) => {
  return (
    <div className="text-center p-8 border-2 border-dashed border-white/20 rounded-lg bg-white/10 backdrop-blur-lg">
      <Icon className="mx-auto h-12 w-12 text-slate-500" />
      <h3 className="mt-2 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;