import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon: Icon }) => {
  const changeColor = changeType === 'increase' ? 'text-accent' : 'text-danger';
  
  return (
    <div className="rounded-lg bg-white/10 backdrop-blur-lg border border-white/10 p-5 shadow-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-slate-400" aria-hidden="true" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="truncate text-sm font-medium text-slate-400">{title}</dt>
            <dd className="flex items-baseline">
              <p className="text-2xl font-semibold text-white">{value}</p>
              {change && (
                <p className={`ml-2 flex items-baseline text-sm font-semibold ${changeColor}`}>
                  {changeType === 'increase' ? (
                     <svg className="h-5 w-5 self-center flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.03 9.83a.75.75 0 01-1.06-1.06l5.25-5.25a.75.75 0 011.06 0l5.25 5.25a.75.75 0 11-1.06 1.06L10.75 5.612V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 self-center flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l4.22-4.22a.75.75 0 111.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 111.06-1.06L9.25 14.388V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                    </svg>
                  )}
                  {change}
                </p>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default StatCard;