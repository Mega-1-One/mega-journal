import React from 'react';
import './globals.css';
import { Space_Grotesk, IBM_Plex_Sans } from 'next/font/google';
import { AppProvider } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { AddTradeModal } from '@/components/trades/AddTradeModal';
import { CommandPalette } from '@/components/layout/CommandPalette';

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
  description: 'SaaS-grade professional trading journal, quantitative analytics platform, strategy playbooks, prop-firm risk monitoring, and AI analyst.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} dark`}>
      <body className="bg-bg-main text-text-primary min-h-screen flex antialiased font-body">
        <AppProvider>
          <div className="flex w-full min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar />
              <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">{children}</main>
            </div>
          </div>
          <AddTradeModal />
          <CommandPalette />
        </AppProvider>
      </body>
    </html>
  );
}
