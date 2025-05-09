'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  FileText,
  Scroll,
  LineChart,
  Activity,
  Palette,
  Settings,
  HelpCircle,
  ChevronRight,
  Compass
} from 'lucide-react';

interface SidebarProps {
  isMobile?: boolean;
}

export default function Sidebar({ isMobile = false }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const renderNavItem = (
    path: string,
    label: string,
    icon: React.ReactNode,
    hasSubmenu: boolean = false
  ) => {
    const active = isActive(path);

    return (
      <Link href={path} className={`block ${isMobile ? '' : 'group-hover:mx-0 mx-2'} my-1`}>
        <div
          className={`
            flex items-center h-12 rounded-lg
            ${isMobile ? 'pl-4' : 'justify-center group-hover:justify-start group-hover:px-4'}
            ${active ? 'bg-midnight-navy/70 text-pure-white' : 'text-neon-text/80 hover:bg-midnight-navy/50 hover:text-pure-white'}
            transition-all duration-200 ease-in-out relative overflow-hidden
          `}
        >
          {active && !isMobile && (
            <div className="absolute left-0 top-0 h-full w-1 bg-neon-lilac rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-150"></div>
          )}
           {active && isMobile && (
            <div className="absolute left-0 top-0 h-full w-1 bg-neon-lilac rounded-r-full"></div>
          )}
          <span className="flex-shrink-0 w-6 h-6">{icon}</span>
          <span
            className={`
              font-medium whitespace-nowrap
              ${isMobile ? 'ml-3 opacity-100 w-auto' : 'opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto group-hover:ml-3 group-hover:delay-150'}
              transition-all duration-200 ease-in-out
            `}
          >
            {label}
          </span>
          {hasSubmenu && (
            <ChevronRight
              className={`
                ml-auto h-4 w-4
                ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:delay-150'}
                transition-opacity duration-200
              `}
            />
          )}
        </div>
      </Link>
    );
  };

  return (
    <div
      className={`
        flex flex-col bg-black/95 h-screen shadow-2xl
        ${isMobile
          ? 'w-full'
          : 'fixed top-0 left-0 z-40 hidden lg:flex w-[72px] hover:w-72 transition-all duration-300 ease-in-out group'
        }
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 shrink-0 ${isMobile ? 'pl-4 justify-start' : 'justify-center group-hover:justify-start group-hover:pl-4'} transition-all duration-300 ease-in-out overflow-hidden`}>
        <Link href="/" className={`flex items-center ${isMobile ? '' : 'justify-center group-hover:justify-start'}`}>
          <Image
            src="/cc-logo.png"
            alt="CreatorClaim Logo"
            width={isMobile ? 32 : 40}
            height={isMobile ? 32 : 40}
            className="h-auto transition-all duration-300 ease-in-out group-hover:w-8 group-hover:h-8"
            priority
          />
          <span
            className={`
              text-xl font-bold text-pure-white whitespace-nowrap
              ${isMobile ? 'ml-2 opacity-100 w-auto' : 'opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto group-hover:ml-2 group-hover:delay-150'}
              transition-all duration-200 ease-in-out
            `}
          >
            CreatorClaim
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className={`flex-grow px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden ${isMobile ? '' : 'group-hover:px-4'} transition-all duration-300 ease-in-out`}>
        {renderNavItem('/discover', 'Discover', <Compass />)}
        {renderNavItem('/dashboard', 'Dashboard', <LayoutDashboard />)}
        {renderNavItem('/certificate', 'Certificates', <FileText />)}
        {renderNavItem('/browse', 'Browse Licences', <Scroll />)}
        {renderNavItem('/history', 'Mint History', <Activity />)}
        {renderNavItem('/analytics', 'Analytics', <LineChart />, true)}
        {renderNavItem('/studio', 'Studio', <Palette />)}
      </nav>

      {/* Divider */}
      <div className={`mx-4 my-2 border-t border-neon-text/10 ${isMobile ? '' : 'opacity-0 group-hover:opacity-100 group-hover:delay-150'} transition-opacity duration-200`}></div>

      {/* Secondary navigation */}
      <div className={`px-2 pb-2 space-y-0.5 overflow-x-hidden ${isMobile ? '' : 'group-hover:px-4'} transition-all duration-300 ease-in-out`}>
        {renderNavItem('/settings', 'Settings', <Settings />, true)}
        {renderNavItem('/support', 'Support', <HelpCircle />)}
      </div>

      {/* Bottom section */}
      <div
        className={`
          px-4 py-4 text-xs text-neon-text/60 whitespace-nowrap overflow-hidden shrink-0
          ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:delay-150'}
          transition-opacity duration-200
        `}
      >
        <p>CreatorClaim Demo</p>
        <p>v0.1.0-alpha</p>
      </div>
    </div>
  );
}