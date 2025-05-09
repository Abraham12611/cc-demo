'use client';

import Link from 'next/link';
import Image from 'next/image';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export default function NavigationBar() {
  const { connected } = useWallet();

  return (
    <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="text-2xl font-bold text-pure-white">
        <Link href="/">
          <Image
            src="/cc-logo.png"
            alt="CreatorClaim Logo"
            width={80}
            height={40}
            className="h-auto"
            priority
          />
        </Link>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center space-x-8 text-neon-text">
        <Link href="/mint" className="hover:text-pure-white transition-colors">Mint Certificate</Link>
        {connected && (
          <Link href="/dashboard" className="hover:text-pure-white transition-colors">Dashboard</Link>
        )}
        <Link href="/docs" className="hover:text-pure-white transition-colors">Docs</Link>
        <Link href="/blog" className="hover:text-pure-white transition-colors">Blog</Link>
        <Link href="/pricing" className="hover:text-pure-white transition-colors">Pricing</Link>
      </div>

      {/* Connect Wallet Button */}
      <div>
        <WalletMultiButton />
      </div>
    </nav>
  );
}