
import React from 'react';

interface HeaderProps {
  title: string;
  onCommandPaletteToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onCommandPaletteToggle }) => {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-800 bg-primary-dark px-4 sm:px-6 lg:px-8">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <div className="flex items-center space-x-4">
        <button 
          onClick={onCommandPaletteToggle}
          className="flex items-center space-x-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-700"
        >
          <span>Search...</span>
          <kbd className="rounded bg-slate-700 px-1.5 py-0.5 text-xs font-mono">⌘K</kbd>
        </button>
        <div className="relative">
          <img
            className="h-8 w-8 rounded-full"
            src="https://picsum.photos/100/100"
            alt="User avatar"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
