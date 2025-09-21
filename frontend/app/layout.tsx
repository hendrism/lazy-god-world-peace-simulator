import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import clsx from 'clsx';

import './globals.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Lazy God – World Peace Simulator',
  description: 'Mobile-first strategy interface for guiding civilizations toward peace.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#050316',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={clsx(outfit.variable, 'bg-night-900')}>
      <body className="min-h-screen bg-night-900 text-white antialiased">
        <div className="relative mx-auto min-h-screen max-w-md px-4 pb-10 pt-6 sm:px-6">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-glow-grid opacity-80" />
          {children}
        </div>
      </body>
    </html>
  );
}
