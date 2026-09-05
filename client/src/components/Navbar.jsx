import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  ShoppingBag,
  Search,
  Users,
  MessageSquare,
  Sparkles,
  User,
  LogOut,
  Plus,
  Award,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const displayName = (user?.name && user.name !== 'Test Student') ? user.name : 'Vikash';

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Clubs', path: '/clubs', icon: Users },
    { name: 'Market', path: '/market', icon: ShoppingBag },
    { name: 'Lost & Found', path: '/lostfound', icon: Search },
    { name: 'Messages', path: '/chat', icon: MessageSquare },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/events');
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* ─── Top Header (Matching Screenshot) ─── */}
      <header className="sticky top-0 z-40 bg-[#0A0B0D]/95 backdrop-blur-md border-b border-[#181B20]">
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Clean Brand Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white whitespace-nowrap">
                  Campus Bond
                </span>
              </Link>
            </div>

            {/* Center: Clean Systematic Tab Navigation matching screenshot */}
            <nav className="hidden md:flex items-center justify-center flex-1 mx-2 lg:mx-4">
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                        active
                          ? 'bg-[#181B20] text-white border border-[#272C35] font-semibold shadow-xs'
                          : 'text-[#7C8592] hover:text-white font-medium hover:bg-[#14161A]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Right: Clean Student Profile Avatar (Image only, details on click) */}
            <div className="flex items-center justify-end flex-shrink-0">
              {user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    title={displayName}
                    aria-label="User Profile"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1C1F26] border-2 border-[#20242B] hover:border-[#4B5563] focus:border-[#4B5563] focus:outline-none transition-all cursor-pointer overflow-hidden flex items-center justify-center p-0.5 active:scale-95 shadow-sm"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={displayName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="font-bold text-xs sm:text-sm text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>

                  {/* Clean Profile Details Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#121417] border border-[#20242B] rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-3 border-b border-[#1E2228] mb-1.5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1C1F26] border border-[#2B303A] text-white flex items-center justify-center overflow-hidden flex-shrink-0 font-bold text-sm">
                          {user.avatar ? (
                            <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-sm text-white">
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">{displayName}</p>
                          <p className="text-[11px] text-[#7C8592] truncate">{user.email}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[10px] bg-[#181B20] text-[#A6B0BC] border border-[#242932] px-2 py-0.5 rounded-md font-medium">
                              {user.branch || 'CSE'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#A6B0BC] hover:text-white hover:bg-[#181B20] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#7C8592]" />
                        <span>My Profile & Activity</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#A6B0BC] hover:text-white hover:bg-[#181B20] transition-colors"
                      >
                        <Award className="w-4 h-4 text-[#7C8592]" />
                        <span>Campus Score</span>
                      </Link>

                      <div className="my-1 border-t border-[#1E2228]" />

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#FF6B6B] hover:bg-[#251515] transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-[#8A94A0] hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#E58A3C] text-white hover:bg-[#D97724] transition-all shadow-md shadow-[#E58A3C]/20"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Bottom Navigation Bar (< md) matching screenshot ─── */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0F1012]/95 backdrop-blur-lg border-t border-[#22262B] px-2 sm:px-4 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.65rem)] shadow-2xl">
          <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
            {/* 1. Home */}
            <Link
              to="/"
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                location.pathname === '/' || location.pathname.startsWith('/events')
                  ? 'text-[#E58A3C]'
                  : 'text-[#8A94A0] hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-0.5">Home</span>
            </Link>

            {/* 2. Club */}
            <Link
              to="/clubs"
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                location.pathname.startsWith('/clubs')
                  ? 'text-[#E58A3C]'
                  : 'text-[#8A94A0] hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-0.5">Club</span>
            </Link>

            {/* 3. Center + Action Button */}
            <div className="flex justify-center items-center">
              <Link
                to="/?create=true"
                className="w-10 h-10 rounded-full bg-[#23272D] border border-[#343A42] flex items-center justify-center shadow-lg hover:border-[#E58A3C] transition-all group active:scale-95"
              >
                <Plus className="w-5 h-5 text-[#E58A3C] group-hover:scale-110 transition-transform" />
              </Link>
            </div>

            {/* 4. Market */}
            <Link
              to="/market"
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                location.pathname.startsWith('/market')
                  ? 'text-[#E58A3C]'
                  : 'text-[#8A94A0] hover:text-white'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-0.5">Market</span>
            </Link>

            {/* 5. More (Profile & Activities) */}
            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                location.pathname.startsWith('/profile') || location.pathname.startsWith('/lostfound') || location.pathname.startsWith('/chat')
                  ? 'text-[#E58A3C]'
                  : 'text-[#8A94A0] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-0.5 my-1">
                <span className="w-1 h-1 rounded-full bg-current" />
                <span className="w-1 h-1 rounded-full bg-current" />
                <span className="w-1 h-1 rounded-full bg-current" />
              </div>
              <span className="text-[10px] font-semibold mt-0.5">More</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
