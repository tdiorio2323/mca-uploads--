import React, { useState, useMemo } from 'react';
import { Merchant, View, DealStatus } from '../../types';
import Skeleton from '../ui/Skeleton';
import { useData } from '../../contexts/DataContext';

type SortKey = 'name' | 'owner' | 'annualRevenue' | 'nsfCount90Days' | 'creditScore' | 'stage';
type SortDirection = 'asc' | 'desc';

interface MerchantsViewProps {
    setView: (view: View) => void;
}

const MerchantsView: React.FC<MerchantsViewProps> = ({ setView }) => {
  const { merchants, deals: allDeals, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const merchantData = useMemo(() => {
    return merchants.map(merchant => {
      const merchantDeals = allDeals.filter(d => d.merchantId === merchant.id).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      const stage = merchantDeals.length > 0 ? merchantDeals[0].status : DealStatus.Lead;
      return { ...merchant, stage };
    });
  }, [merchants, allDeals]);

  const filteredMerchants = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    return merchantData.filter(merchant =>
      Object.values(merchant).some(value =>
        String(value).toLowerCase().includes(lowercasedFilter)
      )
    );
  }, [searchTerm, merchantData]);

  const sortedMerchants = useMemo(() => {
    return [...filteredMerchants].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - a[sortKey];
      }
      
      return 0;
    });
  }, [filteredMerchants, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const SortIcon: React.FC<{ direction?: SortDirection }> = ({ direction }) => {
    if (!direction) return <svg className="w-4 h-4 text-slate-500 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
    return direction === 'asc' ? <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg> : <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
  }

  const renderHeader = (key: SortKey, label: string, className = '') => (
    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider ${className}`}>
      <button className="flex items-center space-x-1 group" onClick={() => handleSort(key)}>
        <span>{label}</span>
        <SortIcon direction={sortKey === key ? sortDirection : undefined} />
      </button>
    </th>
  );
  
  const TableSkeleton = () => (
    <tbody className="divide-y divide-slate-800">
        {Array.from({ length: 10 }).map((_, i) => (
            <tr key={i}>
                <td className="px-6 py-4"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2 mt-1" /></td>
                <td className="px-6 py-4"><Skeleton className="h-5 w-2/3" /></td>
                <td className="px-6 py-4 text-right"><Skeleton className="h-5 w-16 ml-auto" /></td>
                <td className="px-6 py-4 text-right"><Skeleton className="h-5 w-8 ml-auto" /></td>
                <td className="px-6 py-4 text-right"><Skeleton className="h-6 w-12 ml-auto rounded-full" /></td>
                <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                <td className="px-6 py-4 text-right"><Skeleton className="h-5 w-10 ml-auto" /></td>
            </tr>
        ))}
    </tbody>
  );

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4">
            <input 
                type="text"
                placeholder="Search merchants by name, owner, industry..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent"
            />
        </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800/50">
            <tr>
              {renderHeader('name', 'Merchant')}
              {renderHeader('owner', 'Owner')}
              {renderHeader('annualRevenue', 'Revenue (Ann.)', 'text-right')}
              {renderHeader('nsfCount90Days', 'NSF (90d)', 'text-right')}
              {renderHeader('creditScore', 'Score', 'text-right')}
              {renderHeader('stage', 'Stage')}
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
            </tr>
          </thead>
          {loading ? <TableSkeleton /> : (
            <tbody className="divide-y divide-slate-800">
              {sortedMerchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-slate-800/50 cursor-pointer" onClick={() => setView(`merchant/${merchant.id}`)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{merchant.name}</div>
                      <div className="text-sm text-slate-400">{merchant.industry}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{merchant.owner}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300 font-mono">${merchant.annualRevenue.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300 font-mono">{merchant.nsfCount90Days}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${merchant.creditScore >= 750 ? 'bg-amber-400/20 text-amber-300' : merchant.creditScore >= 650 ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
                      {merchant.creditScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{merchant.stage}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <span className="text-accent hover:text-emerald-400">View</span>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

export default MerchantsView;
