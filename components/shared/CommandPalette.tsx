import React, { useState, useEffect, useRef } from 'react';
import { View } from '../../types';

interface CommandPaletteProps {
  onClose: () => void;
  setView: (view: View) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, setView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleNavigation = (view: View) => {
    setView(view);
    onClose();
  };
  
  const pages = [
    { name: 'Dashboard', view: 'dashboard' as View },
    { name: 'Deals Kanban', view: 'deals' as View },
    { name: 'Merchants', view: 'merchants' as View },
    { name: 'Calendar', view: 'calendar' as View },
  ];

  const filteredPages = searchTerm.length > 0
    ? pages.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : pages;


  return (
    <div className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm" aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="flex min-h-full items-start justify-center p-4 pt-[20vh] text-center" onClick={e => e.stopPropagation()}>
        <div className="relative w-full max-w-lg transform text-left transition-all">
          <div className="rounded-lg bg-white/10 backdrop-blur-lg border border-white/10 shadow-2xl">
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
              <input
                ref={inputRef}
                type="text"
                className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-white placeholder-slate-400 focus:ring-0 sm:text-sm"
                placeholder="Search for pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="max-h-[50vh] overflow-y-auto border-t border-slate-700 p-2">
              {filteredPages.length > 0 && (
                 <div>
                  <h3 className="px-2 text-xs font-semibold text-slate-400 uppercase">Pages</h3>
                  <ul className="mt-1">
                    {filteredPages.map(page => (
                      <li key={page.view} onClick={() => handleNavigation(page.view)} className="cursor-pointer rounded-md p-2 text-sm text-slate-200 hover:bg-slate-700">
                        {page.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;