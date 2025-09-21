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
        <div
          className="relative mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-6 sm:max-w-lg sm:px-6"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 bg-glow-grid opacity-80" />
          {children}
        </div>
      </body>
    </html>
  );
}
