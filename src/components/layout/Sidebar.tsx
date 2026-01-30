'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, History, Bookmark, Settings, Sparkles, ChevronRight, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/history', label: 'History', icon: History },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
    router.push('/auth');
  };

  const handleLogin = () => {
    router.push('/auth');
  };

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
          <div className="p-4 rounded-xl bg-linear-to-br from-[#FF5C00] to-[#FF7A00]">
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

          <div className="relative" ref={dropdownRef}>
            {isLoading ? (
              <div className="flex items-center justify-center p-3">
                <div className="animate-spin h-5 w-5 border-2 border-[#FF5C00] border-t-transparent rounded-full" />
              </div>
            ) : isAuthenticated && user ? (
              <>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-2 w-full rounded-lg hover:bg-[#1A1A1D] transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#1A1A1D] flex items-center justify-center text-sm font-medium text-white">
                    {user.initials}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-[#6B6B70] truncate">{user.email}</p>
                  </div>
                  <ChevronRight 
                    size={16} 
                    className={`text-[#6B6B70] transition-transform ${isProfileOpen ? 'rotate-90' : ''}`} 
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#111113] border border-[#1F1F22] rounded-xl shadow-lg overflow-hidden">
                    <div className="px-3 py-2.5 border-b border-[#1F1F22]">
                      <p className="text-xs text-[#6B6B70]">Signed in as</p>
                      <p className="text-sm text-white font-medium truncate">{user.email}</p>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-[#FF3B30] hover:bg-[#2A1515] transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-[#1A1A1D] hover:bg-[#2A2A2D] transition-colors"
              >
                <User size={18} className="text-[#8B8B90]" />
                <span className="text-sm font-medium text-white">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
