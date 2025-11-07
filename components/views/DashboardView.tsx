import React from 'react';
import StatCard from '../ui/StatCard';
import { DealStatus } from '../../types';
import StatusPill from '../ui/StatusPill';
import { useData } from '../../contexts/DataContext';
import Skeleton from '../ui/Skeleton';

// ICONS
const DollarIcon: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
const UserGroupIcon: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.284.064A3 3 0 1 0 5.186 7.248a3 3 0 0 0-2.526 4.516M18.72 18.72A9.094 9.094 0 0 0 18 18.72m-7.284.064A9.094 9.094 0 0 1 12 15.082a9.094 9.094 0 0 1-7.284 3.682M12 15.082a9.094 9.094 0 0 1 6.716 3.64m-13.432-3.64A9.094 9.094 0 0 1 12 15.082" /></svg>
);
const CheckCircleIcon: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
const ClockIcon: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
const FireIcon: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.362-3.797A8.33 8.33 0 0 1 15.362 5.214Z" /></svg>
);
const ExclamationTriangleIcon: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
);

const DashboardSkeleton: React.FC = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-80 rounded-lg" />
            <div className="space-y-6">
                <Skeleton className="h-40 rounded-lg" />
                <Skeleton className="h-40 rounded-lg" />
            </div>
        </div>
    </div>
);

const DashboardView: React.FC = () => {
    const { deals, merchants, tasks, loading } = useData();
    
    if (loading) {
        return <DashboardSkeleton />;
    }

    const fundedThisMonth = deals.filter(d => d.status === DealStatus.Funded).reduce((sum, d) => sum + d.amountRequested, 0);
    const newLeads = deals.filter(d => d.status === DealStatus.Lead).length;
    const fundedCount = deals.filter(d => d.status === DealStatus.Funded).length;
    const avgTimeToFund = 14; // Mock data

    const hotLeads = merchants
        .filter(m => m.creditScore > 750 && m.annualRevenue > 1000000)
        .slice(0, 5)
        .map(m => ({
            merchant: m,
            deal: deals.find(d => d.merchantId === m.id && d.status === DealStatus.Lead)
        }))
        .filter(item => item.deal);

    const needsAttention = tasks
        .filter(t => !t.completed && new Date(t.dueDate) < new Date())
        .slice(0, 5)
        .map(t => ({
            task: t,
            merchant: merchants.find(m => m.id === t.merchantId)
        }));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Funded This Month" value={`$${(fundedThisMonth / 1000).toFixed(0)}k`} change="+12.5%" changeType="increase" icon={DollarIcon}/>
                <StatCard title="New Leads" value={newLeads.toString()} change="+5" changeType="increase" icon={UserGroupIcon}/>
                <StatCard title="Deals Funded" value={fundedCount.toString()} change="-2" changeType="decrease" icon={CheckCircleIcon}/>
                <StatCard title="Avg. Time to Fund" value={`${avgTimeToFund} Days`} change="-1.2 Days" changeType="decrease" icon={ClockIcon}/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold text-white mb-4">Pipeline Snapshot</h2>
                     <div className="h-64 flex items-center justify-center">
                        <div className="w-full space-y-2">
                            {Object.values(DealStatus).map(status => {
                                const count = deals.filter(d => d.status === status).length;
                                const percentage = deals.length > 0 ? (count / deals.length) * 100 : 0;
                                return (
                                <div key={status}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <StatusPill status={status} />
                                        <span className="text-slate-400">{count} deals</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                                        <div className="bg-accent h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><FireIcon className="w-5 h-5 mr-2 text-red-400"/>Hot Leads</h2>
                        <ul className="space-y-3">
                            {hotLeads.map(({merchant, deal}) => merchant && deal && (
                                <li key={merchant.id} className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-medium text-white">{merchant.name}</p>
                                        <p className="text-slate-400 font-mono">${deal.amountRequested.toLocaleString()}</p>
                                    </div>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-400/20 text-amber-300`}>{merchant.creditScore}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><ExclamationTriangleIcon className="w-5 h-5 mr-2 text-amber-400"/>Needs Attention</h2>
                        <ul className="space-y-3">
                           {needsAttention.map(({ task, merchant }) => task && merchant && (
                                <li key={task.id} className="text-sm">
                                    <p className="font-medium text-white truncate">{task.title}</p>
                                    <p className="text-slate-400">For: <span className="font-semibold">{merchant.name}</span></p>
                                </li>
                           ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
