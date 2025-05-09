'use client';

import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function Header() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [darkMode, setDarkMode] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Toggle dark/light mode (for future implementation)
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Fetch the user's Devnet SOL balance
  useEffect(() => {
    const getBalance = async () => {
      if (connected && publicKey && connection) {
        try {
          setIsLoading(true);
          // Get balance from Devnet
          const balance = await connection.getBalance(publicKey);
          // Convert from lamports to SOL
          const balanceInSol = balance / LAMPORTS_PER_SOL;
          setSolBalance(balanceInSol);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
          setSolBalance(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSolBalance(null);
      }
    };

    if (connected && publicKey) {
      getBalance();
      const intervalId = setInterval(getBalance, 30000);
      return () => clearInterval(intervalId);
    } else {
      setSolBalance(null);
    }
  }, [connected, publicKey, connection]);

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-[72px] h-16 bg-black/90 border-b border-neon-text/10 z-30 flex items-center px-6 transition-all duration-300 ease-in-out">
      {/* Left spacing for mobile menu button - only on small screens to not affect desktop layout */}
      <div className="w-10 lg:hidden"></div>

      {/* Search bar - takes up available space */}
      <div className={`relative flex-grow max-w-xl ${searchFocused ? 'ring-1 ring-neon-lilac' : ''}`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neon-text/50" />
        </div>
        <input
          type="text"
          placeholder="Search certificates or tx..."
          className="w-full py-2 pl-10 pr-10 bg-midnight-navy/30 border border-neon-text/20 rounded-lg text-pure-white focus:outline-none focus:border-neon-lilac"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono bg-neon-text/10 text-neon-text/70 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Spacer to push right actions to the edge, works with flex-grow on search */}
      <div className="flex-grow"></div>

      {/* Right side actions */}
      <div className="flex items-center space-x-5 ml-4">
        {/* Notifications - Hidden on small screens */}
        <button className="hidden sm:block p-1.5 rounded-full text-neon-text/70 hover:bg-midnight-navy/50 hover:text-pure-white transition-colors">
          <Bell className="h-5 w-5" />
        </button>

        {/* Theme toggle - Hidden on small screens */}
        <button
          onClick={toggleDarkMode}
          className="hidden sm:block p-1.5 rounded-full text-neon-text/70 hover:bg-midnight-navy/50 hover:text-pure-white transition-colors"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Connect wallet button or wallet info */}
        <div className="ml-1">
          <WalletMultiButton />
        </div>

        {/* Show Devnet wallet balance when connected */}
        {connected && publicKey && (
          <div className="hidden md:flex items-center text-sm font-mono space-x-2 pl-2">
            <span className="bg-electric-cyan/10 px-2 py-1 rounded text-electric-cyan text-xs uppercase font-semibold">Devnet</span>
            <span className="text-neon-text/80">
              {isLoading ? (
                <span className="animate-pulse text-xs">Loading...</span>
              ) : (
                <span>{solBalance !== null ? `${solBalance.toFixed(4)} SOL` : '0.00 SOL'}</span>
              )}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}