import React from 'react';
import './globals.css';
import { Space_Grotesk, IBM_Plex_Sans } from 'next/font/google';
import { AppProvider } from '@/context/AppContext';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex',
  display: 'swap',
});

export const metadata = {
  title: 'MEGA JOURNAL — The Trading Performance Journal',
  description: 'Turn every trade into an edge. Track your trades, understand your performance, and build a repeatable trading process backed by your own data.',
  openGraph: {
    title: 'MEGA JOURNAL — The Trading Performance Journal',
    description: 'Turn every trade into an edge. Track your trades, understand your performance, and build a repeatable trading process.',
    url: 'https://megajournal.io',
    siteName: 'MEGA JOURNAL',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} dark`}>
      <body className="bg-brand-base text-brand-text min-h-screen flex flex-col antialiased font-body selection:bg-brand-cyan/20 selection:text-brand-cyan">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
