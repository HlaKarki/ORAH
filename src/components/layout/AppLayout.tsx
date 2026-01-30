'use client';

import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import MobileTabBar from './MobileTabBar';
import ToastContainer from '../shared/ToastContainer';

interface AppLayoutProps {
  children: ReactNode;
}

const AUTH_ROUTES = ['/auth'];

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some(route => pathname?.startsWith(route));

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#08080A]">
        {children}
        <ToastContainer />
      </div>
    );
  }

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
