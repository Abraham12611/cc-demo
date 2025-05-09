'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, LayoutGrid, List, MoreHorizontal, ShieldCheck, Filter, SlidersHorizontal, ArrowDownUp, MapPin } from 'lucide-react';

// --- Helper Components & Types ---
interface HeroSlideProps {
  imageUrl: string;
  collectionName: string;
  creatorName: string;
  creatorAvatarUrl: string;
  isVerified: boolean;
  floorPrice: number;
  items: number;
  totalVolume: number;
  listedPercent: number;
  ctaLink: string;
}

const HeroSlide: React.FC<HeroSlideProps> = (props) => {
  return (
    <div className="relative aspect-[16/5] w-full rounded-lg overflow-hidden select-none group">
      <Image src={props.imageUrl} alt={props.collectionName} layout="fill" objectFit="cover" className="transition-transform duration-500 group-hover:scale-105" loading="lazy" />
      {/* Left/Right blur masks */}
      <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/50 to-transparent"></div>
      <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/50 to-transparent"></div>

      <div className="absolute bottom-0 left-0 p-6 md:p-8 text-pure-white z-10 w-full">
        <div className="flex items-center mb-3">
          <Image src={props.creatorAvatarUrl} alt={props.creatorName} width={32} height={32} className="rounded-full mr-2 border-2 border-pure-white/50" />
          <span className="text-sm font-medium mr-1">By {props.creatorName}</span>
          {props.isVerified && <ShieldCheck size={16} className="text-electric-cyan" />}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">{props.collectionName}</h2>

        {/* KPI Pills */}
        <div className="flex flex-wrap gap-2 bg-black/60 backdrop-blur-sm rounded-md p-2 max-w-max">
          <KPITag label="FLOOR" value={`${props.floorPrice.toFixed(3)} SOL`} />
          <KPITag label="ITEMS" value={props.items.toLocaleString()} />
          <KPITag label="TOTAL VOLUME" value={`${(props.totalVolume / 1000).toFixed(1)}K SOL`} />
          <KPITag label="LISTED" value={`${props.listedPercent.toFixed(1)}%`} className="hidden sm:flex" />
        </div>
         <Link href={props.ctaLink} className="mt-4 inline-block">
            <button className="bg-neon-lilac text-pure-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-opacity-90 transition-opacity">
              View Collection
            </button>
          </Link>
      </div>
    </div>
  );
};

const KPITag: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
  <div className={`flex flex-col px-3 py-1 rounded ${className ? className : ''}`}>
    <span className="text-xs text-neon-text/70 uppercase tracking-wider">{label}</span>
    <span className="text-sm font-semibold text-pure-white">{value}</span>
  </div>
);

interface CategoryChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}
const CategoryChip: React.FC<CategoryChipProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
      ${isActive ? 'bg-neon-lilac text-pure-white' : 'bg-midnight-navy/50 border border-neon-text/30 text-neon-text hover:border-neon-lilac hover:text-pure-white'}
    `}
    role="tab"
    aria-selected={isActive}
  >
    {label}
  </button>
);

interface CollectionCardProps {
  imageUrl: string;
  name: string;
  floorPrice: number;
  volumeChange: number; // Percentage
  isVerified: boolean;
  creatorAvatar?: string;
}

const CollectionCard: React.FC<CollectionCardProps> = (props) => {
  const volumeChangePositive = props.volumeChange >= 0;
  return (
    <div className="bg-dark-card rounded-lg overflow-hidden shadow-md hover:shadow-[0_2px_6px_rgba(0,0,0,.4)] hover:-translate-y-0.5 transition-all duration-200 w-[280px] flex-shrink-0 snap-start">
      <Link href="#" className="block">
        <div className="relative aspect-[3/2]">
          <Image src={props.imageUrl} alt={props.name} layout="fill" objectFit="cover" loading="lazy" />
           {props.creatorAvatar && (
            <Image src={props.creatorAvatar} alt="" width={36} height={36} className="rounded-full absolute bottom-2 right-2 border-2 border-dark-card"/>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center mb-1">
            <h3 className="text-md font-semibold text-pure-white truncate mr-1">{props.name}</h3>
            {props.isVerified && <ShieldCheck size={16} className="text-electric-cyan flex-shrink-0" />}
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-neon-text/70">FLOOR</span>
            <span className="text-pure-white font-medium">{props.floorPrice.toFixed(2)} SOL</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-0.5">
            <span className="text-neon-text/70">24H VOL</span>
            <span className={`${volumeChangePositive ? 'text-electric-cyan' : 'text-coral-red'}`}>
              {volumeChangePositive ? '+' : ''}{props.volumeChange.toFixed(1)}%
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

// --- Main Page Component ---
export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Photography', 'Music', 'Art', 'Avatars', 'Gaming', 'Memberships', 'Writing', 'Code'];

  // Placeholder Data
  const heroSlidesData: HeroSlideProps[] = [
    { imageUrl: '/redacted-babies.png', collectionName: 'Redacted Remilio Babies', creatorName: '43e2e7', creatorAvatarUrl: '/43e2e7.png', isVerified: true, floorPrice: 0.5567, items: 9997, totalVolume: 48100, listedPercent: 4.7, ctaLink: '#' },
    { imageUrl: '/abstract dreams.png', collectionName: 'Abstract Dreams', creatorName: 'VisionaryArt', creatorAvatarUrl: '/visionary-art.png', isVerified: true, floorPrice: 1.2, items: 500, totalVolume: 25000, listedPercent: 10.2, ctaLink: '#'  },
    { imageUrl: '/synth-waves.png', collectionName: 'Synthwave Beats', creatorName: 'RetroSounds', creatorAvatarUrl: '/RetroSounds.png', isVerified: false, floorPrice: 0.25, items: 2000, totalVolume: 5000, listedPercent: 8.0, ctaLink: '#' },
  ];

  const featuredCollectionsData: CollectionCardProps[] = [
    { imageUrl: '/Paradox-Visions.png', name: 'Paradox Visions', floorPrice: 0.0198, volumeChange: -49.9, isVerified: true, creatorAvatar: '/43e2e7.png' },
    { imageUrl: '/OK-COMPUTERS.png', name: 'OK COMPUTERS', floorPrice: 0.02, volumeChange: -13.8, isVerified: true, creatorAvatar: '/RetroSounds.png' },
    { imageUrl: '/Moriusa.png', name: 'Moriusa (もりうさ)', floorPrice: 0.422, volumeChange: -15.6, isVerified: true, creatorAvatar: '/visionary-art.png' },
    { imageUrl: '/world-of-women.png', name: 'World of Women', floorPrice: 0.4176, volumeChange: -0.5, isVerified: true, creatorAvatar: '/43e2e7.png' },
    { imageUrl: '/cyberpunks.png', name: 'CryptoPunks', floorPrice: 50.5, volumeChange: 5.2, isVerified: true, creatorAvatar: '/RetroSounds.png' },
    { imageUrl: '/placeholder-collection-6.jpg', name: 'Bored Ape Yacht Club', floorPrice: 30.1, volumeChange: 2.1, isVerified: true, creatorAvatar: '/visionary-art.png' },
  ];

  const heroCarouselRef = useRef<HTMLDivElement>(null);

  const scrollHero = (direction: 'left' | 'right') => {
    if (heroCarouselRef.current) {
      const scrollAmount = heroCarouselRef.current.offsetWidth;
      heroCarouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-discover-canvas-gradient text-pure-white">
      {/* Page-specific Top Bar / Controls */}
      <div className="sticky top-0 z-30 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full max-w-md lg:max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neon-text/50" />
            <input
              type="search"
              placeholder="Search certificates, creators…"
              className="w-full py-2 pl-10 pr-4 bg-midnight-navy/30 border border-neon-text/20 rounded-lg text-pure-white focus:outline-none focus:border-neon-lilac"
            />
             <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-block px-2 py-0.5 text-xs font-mono bg-neon-text/10 text-neon-text/70 rounded">
              ⌘K
            </kbd>
          </div>

          {/* Right side controls (placeholder) */}
          <div className="flex items-center gap-2 ml-4">
            <button className="p-2 rounded-lg text-neon-text/70 hover:bg-midnight-navy/30"><Filter size={20} /></button>
            <button className="p-2 rounded-lg text-neon-text/70 hover:bg-midnight-navy/30"><ArrowDownUp size={20} /></button>
            <button className="p-2 rounded-lg text-neon-text/70 hover:bg-midnight-navy/30 hidden sm:block"><LayoutGrid size={20} /></button>
            <button className="p-2 rounded-lg text-neon-text/70 hover:bg-midnight-navy/30 hidden sm:block"><List size={20} /></button>
            <button className="p-2 rounded-lg text-neon-text/70 hover:bg-midnight-navy/30"><MoreHorizontal size={20} /></button>
          </div>
        </div>
        {/* Category Filter Bar */}
        <div className="py-3 border-b border-neon-text/10 overflow-x-auto scrollbar-hide">
          <div className="container mx-auto px-6 flex items-center gap-2" role="tablist">
            {categories.map(category => (
              <CategoryChip
                key={category}
                label={category}
                isActive={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-8">
        {/* Hero Carousel */}
        <section className="mb-12 relative">
          <div ref={heroCarouselRef} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-lg">
            {heroSlidesData.map((slide, index) => (
              <div key={index} className="w-full flex-shrink-0 snap-center">
                <HeroSlide {...slide} />
              </div>
            ))}
          </div>
          <button onClick={() => scrollHero('left')} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-pure-white transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => scrollHero('right')} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-pure-white transition-colors">
            <ChevronRight size={24} />
          </button>
          {/* Dots indicator (simple version) */}
          <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 flex gap-2">
            {heroSlidesData.map((_, index) => (
                // Basic active state, needs improvement for actual scroll position
                <div key={`dot-${index}`} className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-neon-lilac' : 'bg-neon-text/30'}`}></div>
            ))}
           </div>
        </section>

        {/* Featured Collections Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-pure-white">Featured Collections</h2>
              <p className="text-sm text-neon-text/70">This week's curated collections by our team.</p>
            </div>
            <Link href="#" className="text-sm text-electric-cyan hover:underline">View All</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory -mx-1 px-1">
            {featuredCollectionsData.map((collection, index) => (
              <CollectionCard key={index} {...collection} />
            ))}
          </div>
           {/* Dots indicator placeholder */}
        </section>

        {/* TODO: Top Movers Today */}
        {/* TODO: Highest Weekly Sales */}
        {/* TODO: Newest Certificates */}
        {/* TODO: Trending Audio Loops */}

      </div>

      {/* TODO: Floating KPI Bar (on scroll) */}
    </div>
  );
}

// Helper to hide scrollbar (add to globals.css if preferred)
// .scrollbar-hide::-webkit-scrollbar { display: none; }
// .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }