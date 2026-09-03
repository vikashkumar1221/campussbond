import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  ShoppingBag,
  Search,
  Users,
  MessageSquare,
  Sparkles,
  ChevronDown,
  User,
  LogOut,
  Plus,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const navItems = [
    { name: 'Feed', path: '/', icon: Compass },
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
      {/* ─── Top Header (Desktop & Mobile) ─── */}
      <header className="sticky top-0 z-40 bg-[#0F1012]/95 backdrop-blur-md border-b border-[#22262B]">
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Clean Brand Logo */}
            <div className="flex items-center flex-1">
              <Link to="/" className="flex items-center">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  Campus Bond
                </span>
              </Link>
            </div>

            {/* Center: Centered Systematic Pill Navigation (>= md) */}
            <nav className="hidden md:flex items-center justify-center">
              <div className="flex items-center p-1 bg-[#141619] border border-[#24282E] rounded-full gap-0.5 shadow-inner">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        active
                          ? 'bg-[#1E2228] text-white border border-[#3A414A] shadow-xs'
                          : 'text-[#8A94A0] hover:text-white hover:bg-[#1E2228]/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Right: Clean Student Profile Pill */}
            <div className="flex items-center justify-end flex-1">
              {user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1D21] border border-[#282D33] hover:border-[#3A414A] transition-all cursor-pointer shadow-xs group"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#23272D] border border-[#343A42] text-[#8A94A0] group-hover:text-white flex items-center justify-center overflow-hidden flex-shrink-0 transition-colors">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="text-left">
                      <p className="text-xs font-bold text-white group-hover:text-[#E58A3C] transition-colors truncate max-w-[120px]">
                        {user.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#F59E0B] bg-[#2A2012] border border-[#F59E0B]/20 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#F59E0B]" />
                      <span>{user.campusScore || 0}</span>
                    </div>

                    <ChevronDown className={`w-3.5 h-3.5 text-[#8A94A0] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Clean Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-[#1A1D21] border border-[#282D33] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2.5 border-b border-[#252A30] mb-1">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-[#8A94A0] truncate">{user.email}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-[10px] bg-[#131518] text-[#8A94A0] border border-[#282D33] px-2 py-0.5 rounded-md">
                            {user.branch || 'Campus Student'}
                          </span>
                          <span className="text-[10px] bg-[#2A2012] text-[#F59E0B] border border-[#F59E0B]/20 px-2 py-0.5 rounded-md font-bold">
                            ★ {user.campusScore || 0} pts
                          </span>
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#8A94A0] hover:text-white hover:bg-[#23272D] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile & Activity</span>
                      </Link>

                      <Link
                        to="/chat"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#8A94A0] hover:text-white hover:bg-[#23272D] transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Direct Messages</span>
                      </Link>

                      <div className="my-1 border-t border-[#252A30]" />

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#FF6B6B] hover:bg-[#2B1818] transition-colors cursor-pointer text-left"
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
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0F1012] border-t border-[#22262B] px-3 py-2 shadow-2xl">
          <div className="grid grid-cols-5 gap-1 items-center">
            {/* 1. Home */}
            <Link
              to="/"
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                location.pathname === '/' || location.pathname.startsWith('/events')
                  ? 'text-white'
                  : 'text-[#8A94A0] hover:text-white'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1">Home</span>
            </Link>

            {/* 2. Club */}
            <Link
              to="/clubs"
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                location.pathname.startsWith('/clubs')
                  ? 'text-white'
                  : 'text-[#8A94A0] hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1">Club</span>
            </Link>

            {/* 3. Center + Action Button (exact match to screenshot!) */}
            <div className="flex justify-center items-center">
              <Link
                to="/"
                className="w-10 h-10 rounded-full bg-[#23272D] border border-[#343A42] flex items-center justify-center shadow-lg hover:border-[#E58A3C] transition-all group"
              >
                <Plus className="w-5 h-5 text-[#E58A3C] group-hover:scale-110 transition-transform" />
              </Link>
            </div>

            {/* 4. Market */}
            <Link
              to="/market"
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                location.pathname.startsWith('/market')
                  ? 'text-white'
                  : 'text-[#8A94A0] hover:text-white'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1">Market</span>
            </Link>

            {/* 5. More (Profile & Activities) */}
            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                location.pathname.startsWith('/profile') || location.pathname.startsWith('/lostfound') || location.pathname.startsWith('/chat')
                  ? 'bg-[#1E2228] text-white border border-[#2D333B]'
                  : 'text-[#8A94A0] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-1 rounded-full bg-current" />
                <span className="w-1 h-1 rounded-full bg-current" />
                <span className="w-1 h-1 rounded-full bg-current" />
              </div>
              <span className="text-[10px] font-semibold mt-1">More</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
