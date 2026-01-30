'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, Bookmark, Settings } from 'lucide-react';

const tabItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/history', label: 'History', icon: History },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0C0C0E] border-t border-[#1F1F22] px-10 py-3 pb-7 z-50">
      <div className="flex items-center justify-between">
        {tabItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1"
            >
              <Icon 
                size={22} 
                className={isActive ? 'text-[#FF5C00]' : 'text-[#6B6B70]'} 
              />
              <span 
                className={`text-[11px] font-medium ${
                  isActive ? 'text-[#FF5C00]' : 'text-[#6B6B70]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
