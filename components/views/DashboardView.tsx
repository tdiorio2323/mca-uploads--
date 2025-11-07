import React from 'react';
import StatCard from '../ui/StatCard';
import { DealStage, DealStageLabels } from '../../types';
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

    // MCA-specific metrics
    const totalPipelineValue = deals.reduce((sum, d) => sum + d.requestedAmount, 0);
    const approvedValue = deals
        .filter(d => d.approvedAmount !== null)
        .reduce((sum, d) => sum + (d.approvedAmount || 0), 0);
    const newLeadsCount = deals.filter(d => d.stage === DealStage.Leads).length;
    const hotLeadsCount = deals.filter(d => d.stage === DealStage.HotLeads).length;
    const avgFactorRate = deals
        .filter(d => d.factorRate !== null)
        .reduce((sum, d, _, arr) => sum + (d.factorRate || 0) / arr.length, 0)
        .toFixed(2);

    // Hot leads with high revenue and good engagement
    const hotLeadsWithDeals = deals
        .filter(d => d.stage === DealStage.HotLeads)
        .map(d => ({
            deal: d,
            merchant: merchants.find(m => m.id === d.merchantId)
        }))
        .filter(item => item.merchant)
        .slice(0, 5);

    // Overdue tasks and stale deals
    const needsAttention = tasks
        .filter(t => !t.completed && new Date(t.dueDate) < new Date())
        .slice(0, 5)
        .map(t => ({
            task: t,
            merchant: merchants.find(m => m.id === t.merchantId)
        }));

    // Pipeline funnel visualization (in order)
    const stagesInOrder = [
        DealStage.Leads,
        DealStage.ChaseDocs,
        DealStage.DocsIn,
        DealStage.AppOut,
        DealStage.HotLeads,
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Pipeline"
                    value={`$${(totalPipelineValue / 1000).toFixed(0)}k`}
                    change={`${deals.length} deals`}
                    changeType="neutral"
                    icon={DollarIcon}
                />
                <StatCard
                    title="Approved Value"
                    value={`$${(approvedValue / 1000).toFixed(0)}k`}
                    change="Ready to fund"
                    changeType="increase"
                    icon={CheckCircleIcon}
                />
                <StatCard
                    title="Hot Leads"
                    value={hotLeadsCount.toString()}
                    change="Close ASAP"
                    changeType="increase"
                    icon={FireIcon}
                />
                <StatCard
                    title="Avg Factor Rate"
                    value={avgFactorRate || 'N/A'}
                    change="Current deals"
                    changeType="neutral"
                    icon={ClockIcon}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold text-white mb-4">MCA Pipeline Funnel</h2>
                     <div className="h-64 flex items-center justify-center">
                        <div className="w-full space-y-3">
                            {stagesInOrder.map(stage => {
                                const count = deals.filter(d => d.stage === stage).length;
                                const totalValue = deals
                                    .filter(d => d.stage === stage)
                                    .reduce((sum, d) => sum + d.requestedAmount, 0);
                                const percentage = deals.length > 0 ? (count / deals.length) * 100 : 0;

                                return (
                                <div key={stage}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <div className="flex items-center gap-2">
                                            <StatusPill stage={stage} />
                                            <span className="text-white font-medium">{DealStageLabels[stage]}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-slate-300 font-mono">${(totalValue / 1000).toFixed(0)}k</span>
                                            <span className="text-slate-500 ml-2">({count})</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-700/50 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${
                                                stage === DealStage.HotLeads
                                                    ? 'bg-gradient-to-r from-orange-500 to-red-500'
                                                    : 'bg-gradient-to-r from-blue-500 to-accent'
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                );
                            })}
                            <div className="pt-2 border-t border-slate-700 flex justify-between text-xs text-slate-400">
                                <span>Follow Up: {deals.filter(d => d.stage === DealStage.FollowUp).length} deals</span>
                                <span>${(deals.filter(d => d.stage === DealStage.FollowUp).reduce((sum, d) => sum + d.requestedAmount, 0) / 1000).toFixed(0)}k</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-lg border border-orange-400/30 p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <FireIcon className="w-5 h-5 mr-2 text-orange-400"/>
                            Hot Leads
                        </h2>
                        {hotLeadsWithDeals.length === 0 ? (
                            <p className="text-slate-400 text-sm">No hot leads at the moment</p>
                        ) : (
                            <ul className="space-y-3">
                                {hotLeadsWithDeals.map(({deal, merchant}) => merchant && (
                                    <li key={deal.id} className="flex items-center justify-between text-sm border-b border-orange-500/20 pb-2">
                                        <div className="flex-1">
                                            <p className="font-medium text-white">{merchant.businessName}</p>
                                            <p className="text-slate-300 font-mono text-xs">
                                                ${(deal.requestedAmount / 1000).toFixed(0)}k
                                                {deal.approvedAmount && ` → $${(deal.approvedAmount / 1000).toFixed(0)}k`}
                                            </p>
                                        </div>
                                        <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full font-bold">URGENT</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-warning"/>
                            Needs Attention
                        </h2>
                        {needsAttention.length === 0 ? (
                            <p className="text-slate-400 text-sm">All caught up!</p>
                        ) : (
                            <ul className="space-y-3">
                               {needsAttention.map(({ task, merchant }) => task && merchant && (
                                    <li key={task.id} className="text-sm border-b border-slate-700 pb-2">
                                        <p className="font-medium text-white truncate">{task.title}</p>
                                        <p className="text-slate-400 text-xs">
                                            {merchant.businessName} ·
                                            <span className="text-red-400 ml-1">Overdue {Math.floor((Date.now() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                                        </p>
                                    </li>
                               ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;