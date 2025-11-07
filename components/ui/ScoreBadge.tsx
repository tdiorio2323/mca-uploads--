
import React from 'react';

interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  const getColor = () => {
    if (score >= 85) return 'bg-amber-400 text-amber-950';
    if (score >= 70) return 'bg-amber-500 text-amber-50';
    return 'bg-red-500 text-red-50';
  };

  return (
    <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 ${getColor().replace('bg-', 'border-')}`}>
      <span className="text-3xl font-bold">{score}</span>
      <span className="text-xs uppercase tracking-wider">{score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Risky'}</span>
    </div>
  );
};

export default ScoreBadge;