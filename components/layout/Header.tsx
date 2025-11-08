
import React from 'react';

interface HeaderProps {
  title: string;
  onCommandPaletteToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onCommandPaletteToggle }) => {
  return (
    <header className="flex h-20 flex-shrink-0 items-center justify-between border-b border-gold/20 bg-black/40 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
      {/* Left spacer */}
      <div className="flex-1"></div>

      {/* Centered Logo */}
      <div className="flex items-center justify-center">
        <img
          className="h-12 object-contain"
          src="/assets/logo.png"
          alt="MCA Nexus Logo"
          onError={(e) => {
            // Fallback to text if image doesn't load
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling;
            if (fallback) fallback.classList.remove('hidden');
          }}
        />
        <h1 className="hidden text-2xl font-bold bg-gradient-to-r from-gold via-gold-shimmer to-gold bg-clip-text text-transparent">
          MCA NEXUS
        </h1>
      </div>

      {/* Right side - Controls */}
      <div className="flex flex-1 items-center justify-end space-x-4">
        <button
          onClick={onCommandPaletteToggle}
          className="group flex items-center space-x-2 rounded-lg border border-white/30 bg-gradient-to-br from-gold/30 to-gold/10 backdrop-blur-md px-4 py-2 text-sm text-white shadow-lg hover:from-gold/40 hover:to-gold/20 hover:shadow-gold/20 transition-all duration-200"
        >
          <svg className="w-4 h-4 stroke-white stroke-2" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span className="font-medium">Search...</span>
          <kbd className="rounded bg-black/40 px-2 py-1 text-xs font-mono border border-white/20">⌘K</kbd>
        </button>
        <div className="relative">
          <img
            className="h-10 w-10 rounded-full ring-2 ring-gold/50"
            src="https://picsum.photos/100/100"
            alt="User avatar"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
