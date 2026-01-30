'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, Bookmark, Settings, Sparkles, ChevronRight } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/history', label: 'History', icon: History },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 h-screen flex-col bg-[#0C0C0E] border-r border-[#1F1F22] fixed left-0 top-0">
      <div className="flex flex-col h-full p-4 justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5C00]" />
            <span className="text-sm font-semibold tracking-widest text-white">EXPLAINIT</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item w-full ${isActive ? 'active' : ''}`}
                >
                  <Icon 
                    size={18} 
                    className={isActive ? 'text-[#FF5C00]' : 'text-[#6B6B70]'} 
                  />
                  <span className={isActive ? 'font-medium' : ''}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#FF5C00] to-[#FF7A00]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-white" />
              <span className="text-xs font-semibold text-white">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-white/80 mb-3">
              Get unlimited explanations and premium voices
            </p>
            <button className="w-full py-2 px-4 bg-white text-[#FF5C00] text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors">
              Upgrade Now
            </button>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1A1A1D] transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-[#1A1A1D] flex items-center justify-center text-sm font-medium text-white">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">John Doe</p>
              <p className="text-xs text-[#6B6B70] truncate">john@example.com</p>
            </div>
            <ChevronRight size={16} className="text-[#6B6B70]" />
          </div>
        </div>
      </div>
    </aside>
  );
}
