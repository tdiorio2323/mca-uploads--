import React from 'react';

interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  const getStyles = () => {
    if (score >= 85) return 'bg-accent text-emerald-950 border-emerald-600';
    if (score >= 70) return 'bg-warning text-amber-950 border-amber-600';
    return 'bg-danger text-red-50 border-red-600';
  };

  const getLabel = () => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Risky';
  };

  return (
    <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 ${getStyles()}`}>
      <span className="text-3xl font-bold">{score}</span>
      <span className="text-xs uppercase tracking-wider">{getLabel()}</span>
    </div>
  );
};

export default ScoreBadge;