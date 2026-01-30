'use client';

import { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileTabBar from './MobileTabBar';
import ToastContainer from '../shared/ToastContainer';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#08080A]">
      <Sidebar />
      
      <main className="md:ml-60 min-h-screen pb-24 md:pb-0">
        {children}
      </main>
      
      <MobileTabBar />
      <ToastContainer />
    </div>
  );
}
