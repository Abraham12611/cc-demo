import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from './providers';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MobileMenu from "../components/MobileMenu";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "CreatorClaim - Dashboard Demo",
  description: "Demo of the CreatorClaim platform for NFT creators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`antialiased bg-midnight-navy text-neon-text min-h-screen`}
      >
        <WalletContextProvider>
          <div className="flex h-screen">
            {/* Sidebar - hidden on mobile */}
            <Sidebar />

            {/* Mobile menu */}
            <MobileMenu />

            {/* Main content */}
            <div className="flex-1 lg:ml-[72px]">
              {/* Header */}
              <Header />

              {/* Page content */}
              <main className="pt-16 min-h-screen">
                {children}
              </main>
            </div>
          </div>
        </WalletContextProvider>
      </body>
    </html>
  );
}
