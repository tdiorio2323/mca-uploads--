import React, { useState, useCallback, useEffect } from 'react';
import { View } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/views/DashboardView';
import DealsKanbanView from './components/views/DealsKanbanView';
import MerchantsView from './components/views/MerchantsView';
import MerchantProfileView from './components/views/MerchantProfileView';
import CalendarView from './components/views/CalendarView';
import CommandPalette from './components/shared/CommandPalette';
import { useData } from './contexts/DataContext';


const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { merchants, loading: loadingMerchants } = useData();
  
  const handleSetView = useCallback((newView: View) => {
    setView(newView);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const renderView = () => {
    if (view.startsWith('merchant/')) {
      const merchantId = view.split('/')[1];
      const merchant = merchants.find(m => m.id === merchantId);
      if (merchant) {
        return <MerchantProfileView merchant={merchant} setView={handleSetView} />;
      }
      // Fallback if merchant not found or still loading
      if (!loadingMerchants) {
        setView('merchants');
      }
      return <MerchantsView setView={handleSetView} />;
    }

    switch (view) {
      case 'dashboard':
        return <DashboardView />;
      case 'deals':
        return <DealsKanbanView setView={handleSetView}/>;
      case 'merchants':
        return <MerchantsView setView={handleSetView} />;
      case 'calendar':
        return <CalendarView />;
      default:
        return <DashboardView />;
    }
  };

  const getPageTitle = () => {
    if (view.startsWith('merchant/')) {
        const merchantId = view.split('/')[1];
        const merchant = merchants.find(m => m.id === merchantId);
        return merchant ? `Merchant: ${merchant.name}` : "Merchant Profile";
    }
    switch(view) {
        case 'dashboard': return 'Dashboard';
        case 'deals': return 'Deals Pipeline';
        case 'merchants': return 'Merchant Directory';
        case 'calendar': return 'Calendar';
        default: return 'MCA Nexus CRM';
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <Sidebar activeView={view} setView={handleSetView} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={getPageTitle()} onCommandPaletteToggle={() => setCommandPaletteOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-800 to-slate-950 p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
      {isCommandPaletteOpen && <CommandPalette onClose={() => setCommandPaletteOpen(false)} setView={handleSetView} />}
    </div>
  );
};

export default App;
