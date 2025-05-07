'use client';

import { useState, useEffect } from 'react';
import { X, Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('#mobile-menu') && !target.closest('#mobile-menu-button')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        id="mobile-menu-button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-lg bg-black/80 text-neon-text"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden">
          <div
            id="mobile-menu"
            className="h-full w-72 bg-black animate-slide-in"
          >
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-neon-text hover:bg-midnight-navy/30"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <Sidebar isMobile={true} />
          </div>
        </div>
      )}
    </>
  );
}