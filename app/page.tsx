import Link from 'next/link';
import Image from 'next/image'; // Import Image for potential logo/visual
import NavigationBar from '../components/NavigationBar'; // Import the new component

// Placeholder component for animated counter (replace with actual implementation)
const AnimatedCounter = ({ value }: { value: number }) => {
  const formattedValue = value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return <span className="font-bold">{formattedValue}</span>;
};

export default function Home() {
  const betaInviteActive = true; // Control the visibility of the top bar

  return (
    <div className="flex flex-col min-h-screen font-sans bg-midnight-navy text-neon-text">

      {/* Top Bar Announcement */}
      {betaInviteActive && (
        <div className="bg-gradient-to-r from-neon-lilac to-electric-cyan py-2 text-center text-sm text-pure-white font-medium">
          {/* Placeholder for flame icon */}
          <span className="mr-2">🔥</span> Beta Invite now live!
        </div>
      )}

      <NavigationBar /> {/* Use the new component here */}

      {/* Hero Section */}
      <main className={`flex-grow container mx-auto px-6 py-16 md:py-24 flex items-center`}>
        <div className="w-full md:w-1/2 lg:w-3/5">
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-pure-white leading-tight mb-4">
            Own it. License it.<br />
            Get paid in <span className="text-neon-lilac">real time.</span>
        </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-neon-text mb-8 max-w-lg">
            Digital certificates & automated royalties on Solana.
        </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Link href="/dashboard">
              <button className="bg-neon-lilac text-pure-white px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-neon-lilac/30">
                Launch App
              </button>
            </Link>
            <Link href="/docs" className="text-neon-text border border-neon-text/50 px-8 py-3 rounded-lg font-semibold text-lg hover:border-pure-white hover:text-pure-white transition-colors">
               Read Docs
            </Link>
          </div>

          {/* Proof Badge */}
          <div className="text-neon-text text-lg">
             <AnimatedCounter value={7245} /> paid to creators this week
          </div>
        </div>

        {/* Hero Visual Placeholder */}
        <div className="hidden md:block w-1/2 lg:w-2/5 relative">
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-64 h-64 bg-neon-lilac/10 rounded-full blur-3xl"></div>
             <Image
               src="/seal.png"
               alt="Digital Certificate Seal"
               width={400}
               height={400}
               className="animate-[spin_53s_linear_infinite] z-10"
               priority
             />
          </div>
        </div>
      </main>

      {/* Footer (Optional - can add later if needed) */}
      {/* <footer className="container mx-auto px-6 py-4 text-center text-neon-text/50 text-sm">
        © {new Date().getFullYear()} CreatorClaim. All rights reserved.
      </footer> */}
    </div>
  );
}
