'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LineChart,
  ImageIcon,
  CircleDollarSign,
  UsersRound,
  ActivityIcon,
  ListFilter,
  ArrowUpRight,
  Info,
  FileText
} from 'lucide-react';
import {
    fetchDashboardStats, DashboardStats,
    fetchRecentSales, RecentSale,
    fetchCertificatesByCreator, Certificate as CertificateType
} from '../../lib/api'; // Adjusted import path
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import RoyaltyWsClient from '../../components/RoyaltyWsClient';
import FloatingActionButton from '../../components/FloatingActionButton';

// Helper to format date
const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return 'Invalid Date';
    }
};

// Helper to format currency
const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return 'N/A';
    // Ensure it's a number before formatting
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return 'Invalid Amount';
    return numericAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const DashboardPage = () => {
    const { publicKey, connected } = useWallet();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
    const [userCertificates, setUserCertificates] = useState<CertificateType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (connected && publicKey) {
            const loadDashboardData = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const creatorAddress = publicKey.toBase58();
                    // Fetch all data in parallel
                    const [statsData, salesData, certsData] = await Promise.all([
                        fetchDashboardStats(creatorAddress),
                        fetchRecentSales(creatorAddress, 5),
                        fetchCertificatesByCreator(creatorAddress)
                    ]);
                    setStats(statsData);
                    setRecentSales(salesData);
                    setUserCertificates(certsData);
                } catch (err) {
                    console.error("Failed to load dashboard data:", err);
                    setError("Failed to load dashboard data. Please try refreshing.");
                } finally {
                    setIsLoading(false);
                }
            };
            loadDashboardData();
        } else {
            // Reset data if wallet disconnects
            setStats(null);
            setRecentSales([]);
            setUserCertificates([]);
            setIsLoading(false);
            setError(null);
        }
    }, [connected, publicKey]);

    // Empty state content
    if (!connected) {
      return (
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="bg-black/50 p-12 rounded-xl text-center max-w-md mx-auto">
            <ImageIcon size={64} className="mx-auto mb-6 text-neon-lilac opacity-50" />
            <h1 className="text-3xl font-bold text-pure-white mb-4">Welcome to CreatorClaim</h1>
            <p className="text-neon-text/70 mb-8">Connect your wallet to view your creator dashboard, manage certificates, and track royalties.</p>
            <WalletMultiButton />
          </div>
        </div>
      );
    }

    // Loading state
    if (isLoading) {
      return (
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-32 bg-midnight-navy/50 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-midnight-navy/50 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-64 bg-midnight-navy/50 rounded-lg"></div>
              <div className="h-64 bg-midnight-navy/50 rounded-lg"></div>
            </div>
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="bg-black/50 p-12 rounded-xl text-center max-w-md mx-auto">
            <div className="bg-red-500/10 p-3 rounded-full inline-flex mx-auto mb-6">
              <Info size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-pure-white mb-4">Something went wrong</h1>
            <p className="text-neon-text/70 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-neon-lilac text-white px-4 py-2 rounded-lg hover:bg-opacity-80"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return (
        <div className="p-8">
            {/* Hero/Banner Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-midnight-navy to-black mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-lilac/20 to-electric-cyan/10 opacity-30"></div>
                <div className="relative z-10 p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-pure-white mb-2">Creator Dashboard</h1>
                            <p className="text-neon-text/70">Manage your certificates and track royalties</p>
                        </div>
                        <Link href="/mint">
                            <button className="mt-4 md:mt-0 bg-neon-lilac hover:bg-opacity-80 text-white font-medium rounded-lg px-6 py-3 flex items-center transition-all">
                                <span>Create Certificate</span>
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </button>
                        </Link>
                    </div>

                    {/* Stats row similar to OpenSea's FLOOR PRICE, ITEMS, VOLUME */}
                    <div className="mt-8 inline-flex flex-wrap gap-4 bg-black/40 backdrop-blur-sm rounded-lg p-2">
                        <div className="px-4 py-2">
                            <h3 className="text-xs text-neon-text/70 uppercase">Total Certificates</h3>
                            <p className="text-xl font-bold text-pure-white">{stats?.totalCertificates ?? 0}</p>
                        </div>
                        <div className="px-4 py-2 border-l border-neon-text/10">
                            <h3 className="text-xs text-neon-text/70 uppercase">Total Royalties</h3>
                            <p className="text-xl font-bold text-pure-white">{formatCurrency(stats?.totalRoyaltiesEarned)}</p>
                        </div>
                        <div className="px-4 py-2 border-l border-neon-text/10">
                            <h3 className="text-xs text-neon-text/70 uppercase">Licenses Sold</h3>
                            <p className="text-xl font-bold text-pure-white">{stats?.totalLicencesSold ?? 0}</p>
                        </div>
                        <div className="px-4 py-2 border-l border-neon-text/10">
                            <h3 className="text-xs text-neon-text/70 uppercase">Active Rate</h3>
                            <p className="text-xl font-bold text-electric-cyan">
                                {stats && 'activeRate' in stats ? `${stats.activeRate}%` : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Certificates section - 2 columns wide on large screens */}
                <div className="lg:col-span-2 bg-black/50 rounded-xl overflow-hidden border border-neon-text/10">
                    <div className="p-6 border-b border-neon-text/10 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-pure-white flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            Your Certificates
                        </h2>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-midnight-navy/50 text-neon-text/70">
                                <ListFilter className="h-4 w-4" />
                            </button>
                            <Link href="/certificate" className="text-sm text-electric-cyan hover:underline">
                                View All
                            </Link>
                        </div>
                    </div>

                    <div className="p-6">
                        {userCertificates.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {userCertificates.map(cert => (
                                    <Link href={`/certificate/${cert.id}`} key={cert.id}>
                                        <div className="bg-midnight-navy/30 rounded-lg overflow-hidden border border-neon-text/10 hover:border-neon-lilac/30 transition-all hover:shadow-lg hover:translate-y-[-2px]">
                                            <div className="relative h-40 bg-midnight-navy/50">
                                                {cert.imageUrl ? (
                                                    <Image
                                                        src={cert.imageUrl}
                                                        alt={cert.title}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                        className="bg-midnight-navy"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <ImageIcon size={48} className="text-neon-text/30" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-medium text-pure-white truncate">{cert.title}</h3>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-sm text-neon-text/70">Price: {formatCurrency(cert.price)}</span>
                                                    <span className="text-xs bg-electric-cyan/20 text-electric-cyan px-2 py-1 rounded-full">
                                                        {(cert as any).type || 'Standard'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ImageIcon size={48} className="mx-auto mb-4 text-neon-text/30" />
                                <p className="text-neon-text/70 mb-4">You haven't minted any certificates yet</p>
                                <Link href="/mint">
                                    <button className="bg-neon-lilac hover:bg-opacity-80 text-white font-medium rounded-lg px-4 py-2 transition-all">
                                        Mint Your First Certificate
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right sidebar with activity/earnings */}
                <div className="space-y-8">
                    {/* Live Royalty Stream */}
                    <div className="bg-black/50 rounded-xl overflow-hidden border border-neon-text/10">
                        <div className="p-6 border-b border-neon-text/10">
                            <h2 className="text-xl font-bold text-pure-white flex items-center">
                                <CircleDollarSign className="h-5 w-5 mr-2" />
                                Live Royalty Stream
                            </h2>
                        </div>
                        <div className="p-6">
                            <RoyaltyWsClient />
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-black/50 rounded-xl overflow-hidden border border-neon-text/10">
                        <div className="p-6 border-b border-neon-text/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-pure-white flex items-center">
                                <ActivityIcon className="h-5 w-5 mr-2" />
                                Recent Activity
                            </h2>
                            <Link href="/history" className="text-sm text-electric-cyan hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="p-2">
                            {recentSales.length > 0 ? (
                                <ul className="divide-y divide-neon-text/10">
                                    {recentSales.map(sale => (
                                        <li key={sale.id} className="p-4 hover:bg-midnight-navy/30 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-full bg-midnight-navy/50 flex items-center justify-center flex-shrink-0">
                                                    <UsersRound className="h-5 w-5 text-electric-cyan" />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <p className="text-sm text-neon-text/70">
                                                        License sold for <Link href={`/certificate/${sale.certificateId}`} className="text-pure-white hover:text-electric-cyan">{sale.certificateTitle}</Link>
                                                    </p>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-xs text-neon-text/50">{formatDate(sale.timestamp)}</span>
                                                        <span className="text-sm font-medium text-electric-cyan">{formatCurrency(sale.price)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8">
                                    <ActivityIcon size={32} className="mx-auto mb-2 text-neon-text/30" />
                                    <p className="text-neon-text/70">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add floating action button */}
            <FloatingActionButton href="/mint" />
        </div>
    );
};

export default DashboardPage;