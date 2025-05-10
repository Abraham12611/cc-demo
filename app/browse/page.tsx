'use client'; // Likely needs client-side fetching

import React, { useState, useCallback } from 'react';
import CertificateList from '../../components/CertificateList'; // Import existing component
import { Search, SlidersHorizontal, X } from 'lucide-react';
import FloatingActionButton from '../../components/FloatingActionButton';

export default function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [searchInput, setSearchInput] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Function to handle search submission
  const handleSearch = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchTerm(searchInput);
  }, [searchInput]);

  // Debounce search input for better UX
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  // Function to handle price range changes
  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    setPriceRange(prev => ({ ...prev, [type]: value }));
  }, []);

  // Function to clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSearchInput('');
    setPriceRange({});
  }, []);

  return (
    <div className="p-8">
      {/* Hero/Banner Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-midnight-navy to-black mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-lilac/20 to-electric-cyan/10 opacity-30"></div>
        <div className="relative z-10 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-4xl font-bold text-pure-white mb-2">Browse Certificates</h1>
              <p className="text-neon-text/70">Discover and license creative works</p>
            </div>

            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-neon-text/50" />
                <input
                  type="search"
                  placeholder="Search by title..."
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  className="w-full py-2 px-4 pl-10 bg-black/40 backdrop-blur-sm border border-neon-text/20 rounded-lg focus:border-neon-lilac focus:outline-none text-pure-white"
                />
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg ${showFilters ? 'bg-neon-lilac/20 text-neon-lilac' : 'bg-black/40 text-neon-text/70'} hover:bg-neon-lilac/20 hover:text-neon-lilac transition-colors`}
            >
                <SlidersHorizontal className="h-5 w-5" />
            </button>
            </div>
          </div>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
        <div className="mb-8 p-6 border border-neon-text/10 rounded-lg bg-black/50 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-pure-white">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-neon-text/70 hover:text-pure-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-neon-text mb-2">Price Range (USDC)</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    min="0"
                    step="0.01"
                    value={priceRange.min || ''}
                    onChange={e => handlePriceChange(e, 'min')}
                  className="w-full py-2 px-3 bg-midnight-navy/50 border border-neon-text/20 rounded-lg focus:border-neon-lilac focus:outline-none text-pure-white"
                  />
                  <span className="text-neon-text">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    min="0"
                    step="0.01"
                    value={priceRange.max || ''}
                    onChange={e => handlePriceChange(e, 'max')}
                  className="w-full py-2 px-3 bg-midnight-navy/50 border border-neon-text/20 rounded-lg focus:border-neon-lilac focus:outline-none text-pure-white"
                  />
                </div>
              </div>

            {/* Category filter example */}
            <div>
              <h4 className="text-sm font-medium text-neon-text mb-2">Category</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Art', 'Music', 'Photography', 'Writing', 'Code', 'Game Assets'].map(category => (
                <button
                    key={category}
                    className="py-2 px-3 bg-midnight-navy/30 border border-neon-text/10 hover:border-neon-lilac/30 rounded-lg text-neon-text/80 hover:text-pure-white transition-colors text-sm text-left"
                >
                    {category}
                </button>
                ))}
              </div>
            </div>

            {/* Sort option */}
            <div>
              <h4 className="text-sm font-medium text-neon-text mb-2">Sort By</h4>
              <select
                className="w-full py-2 px-3 bg-midnight-navy/50 border border-neon-text/20 rounded-lg focus:border-neon-lilac focus:outline-none text-pure-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={clearFilters}
              className="py-2 px-4 border border-neon-text/20 hover:border-neon-lilac/30 rounded-lg text-neon-text hover:text-pure-white transition-colors"
            >
              Clear All Filters
            </button>
            </div>
          </div>
        )}

        {/* Using the enhanced CertificateList component with search/filter props */}
        <CertificateList
          searchTerm={searchTerm}
          minPrice={priceRange.min}
          maxPrice={priceRange.max}
        />

      {/* Add floating action button */}
      <FloatingActionButton href="/mint" />
    </div>
  );
}