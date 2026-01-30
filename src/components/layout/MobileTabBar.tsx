'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, History, Bookmark, User, LogOut, X } from 'lucide-react';

const tabItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/history', label: 'History', icon: History },
  { href: '/saved', label: 'Saved', icon: Bookmark },
];

const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  initials: 'JD',
};

export default function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsProfileOpen(false);
    router.push('/auth');
  };

  return (
    <>
      {isProfileOpen && (
        <div className="md:hidden fixed inset-0 z-60">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsProfileOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[#111113] rounded-t-2xl border-t border-[#1F1F22] p-4 pb-8 animate-[slideUp_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Account</h3>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-2 rounded-lg hover:bg-[#1A1A1D] transition-colors"
              >
                <X size={20} className="text-[#6B6B70]" />
              </button>
            </div>

            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 p-3 mb-4 bg-[#0C0C0E] rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-[#1A1A1D] flex items-center justify-center text-base font-medium text-white">
                    {mockUser.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-white truncate">
                      {mockUser.firstName} {mockUser.lastName}
                    </p>
                    <p className="text-sm text-[#6B6B70] truncate">{mockUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-[#2A1515] text-[#FF3B30] font-medium transition-colors"
                >
                  <LogOut size={20} />
                  <span>Log out</span>
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-[#8B8B90] mb-4">Sign in to access your account</p>
                <Link
                  href="/auth"
                  onClick={() => setIsProfileOpen(false)}
                  className="btn btn-primary w-full"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0C0C0E] border-t border-[#1F1F22] px-6 py-3 pb-7 z-50">
        <div className="flex items-center justify-between">
          {tabItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-4"
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

          <button
            onClick={() => isLoggedIn ? setIsProfileOpen(true) : router.push('/auth')}
            className="flex flex-col items-center gap-1 px-4"
          >
            {isLoggedIn ? (
              <div className="w-[22px] h-[22px] rounded-full bg-[#1A1A1D] flex items-center justify-center text-[9px] font-medium text-white">
                {mockUser.initials}
              </div>
            ) : (
              <User size={22} className="text-[#6B6B70]" />
            )}
            <span className="text-[11px] font-medium text-[#6B6B70]">
              {isLoggedIn ? 'Account' : 'Sign In'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
