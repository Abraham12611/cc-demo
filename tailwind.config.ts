import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // If using App Router
  ],
  theme: {
    extend: {
       // Add custom theme extensions here if needed
       // Example dark-neon theme colors (adjust extensively)
       colors: {
         'midnight-navy': '#0D102C',
         'neon-text': '#CCD6F6',
         'electric-cyan': '#12E2B2', // Positive
         'neon-secondary': '#f80b67', // Kept as is (Bright pink/magenta - might be unused but keep for now)
         'neon-lilac': '#A470FF',    // Accent
         'pure-white': '#FFFFFF',
         'black': '#0f0f0f',
         'dark-card': '#111827',
         'coral-red': '#FF4C5B',     // Negative
       },
       backgroundImage: {
         'discover-canvas-gradient': 'linear-gradient(to bottom, #0F112A, #181C35)',
       },
       // Add custom animations
       keyframes: {
         fadeIn: {
           '0%': { opacity: '0', transform: 'translateY(-10px)' },
           '100%': { opacity: '1', transform: 'translateY(0)' },
         },
         slideIn: {
           '0%': { opacity: '0', transform: 'translateX(-100%)' },
           '100%': { opacity: '1', transform: 'translateX(0)' },
         }
       },
       animation: {
         fadeIn: 'fadeIn 0.5s ease-out forwards',
         'slide-in': 'slideIn 0.3s ease-out forwards',
       },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'), // For container query based styling if needed later
  ],
};

export default config;