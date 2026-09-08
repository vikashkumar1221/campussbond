import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Home,
  Users,
  ShoppingBag,
  Search,
  MessageSquare,
  Plus,
  User,
  Award,
  Sparkles,
  X,
  Compass,
  ChevronDown,
  Sun,
  Moon,
  Bot,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const [clubsOpen, setClubsOpen] = useState(true);
  const [homeOpen, setHomeOpen] = useState(true);
  const [marketOpen, setMarketOpen] = useState(true);
  const [lostFoundOpen, setLostFoundOpen] = useState(true);

  const navItems = [
    { name: 'Home', path: '/', icon: Home, badge: 'Feed' },
    { name: 'Clubs', path: '/clubs', icon: Users, badge: 'Societies' },
    { name: 'Market', path: '/market', icon: ShoppingBag, badge: 'Store' },
    { name: 'Lost & Found', path: '/lostfound', icon: Search, badge: 'Items' },
    { name: 'Messages', path: '/chat', icon: MessageSquare, badge: 'Chats' },
  ];

  // Topics under Home
  const homeTopics = [
    { label: 'All Topics', value: '' },
    { label: 'Hackathons', value: 'hackathon' },
    { label: 'Project Teams', value: 'project' },
    { label: 'Competitions', value: 'competition' },
    { label: 'Cultural', value: 'cultural' },
    { label: 'Other', value: 'other' },
  ];

  // Club categories from user request
  const clubCategories = [
    { label: 'All Clubs', value: '' },
    { label: 'Tech & Coding', value: 'tech' },
    { label: 'Cultural & Drama', value: 'cultural' },
    { label: 'Sports & Athletics', value: 'sports' },
    { label: 'Academic & Research', value: 'academic' },
    { label: 'Arts & Photography', value: 'arts' },
    { label: 'Social & NGO', value: 'social' },
    { label: 'Other', value: 'other' },
    { label: 'My Clubs', value: 'my-clubs' },
  ];

  // Market categories from user request
  const marketCategories = [
    { label: 'All Items', value: '' },
    { label: 'Books', value: 'books' },
    { label: 'Notes', value: 'notes' },
    { label: 'Lab Kits', value: 'kit' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Instruments', value: 'instruments' },
    { label: 'Furniture', value: 'furniture' },
    { label: 'Other', value: 'other' },
    { label: 'My Listings', value: 'my-listings' },
  ];

  // Lost & Found categories
  const lostFoundCategories = [
    { label: 'All Reports', value: '', param: '' },
    { label: 'Lost Items', value: 'lost', param: 'type' },
    { label: 'Found Items', value: 'found', param: 'type' },
    { label: 'Electronics', value: 'electronics', param: 'category' },
    { label: 'ID Cards', value: 'id-card', param: 'category' },
    { label: 'Keys', value: 'keys', param: 'category' },
    { label: 'Books', value: 'books', param: 'category' },
    { label: 'Accessories', value: 'accessories', param: 'category' },
    { label: 'Clothing', value: 'clothing', param: 'category' },
    { label: 'Other', value: 'other', param: 'category' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/events');
    return location.pathname.startsWith(path);
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Student';

  const NavContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        {/* Brand Logo & Community Tag */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-2xl bg-[#0B1528] dark:bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display text-gray-950 dark:text-white font-black text-xl tracking-tight block leading-none">
                Campus Bond
              </span>
              <span className="text-[10px] text-gray-400 dark:text-slate-400 font-semibold uppercase tracking-wider block mt-1">
                Student Network
              </span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Action: Create Post */}
        <div className="px-1">
          <Link
            to="/"
            onClick={() => {
              if (onClose) onClose();
              window.dispatchEvent(new CustomEvent('open-create-post'));
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0B1528] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-bold tracking-tight shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Post</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 px-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            if (item.name === 'Home') {
              const isHomeActive = isActive(item.path);
              return (
                <div key={item.name} className="space-y-1">
                  <div
                    onClick={() => {
                      setHomeOpen((prev) => !prev);
                      navigate('/');
                      if (onClose && window.innerWidth < 768) onClose();
                    }}
                    className={`font-display flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm tracking-tight transition-all duration-150 cursor-pointer ${
                      isHomeActive && !currentCategory
                        ? 'bg-[#0B1528] dark:bg-blue-600 text-white font-bold shadow-xs'
                        : isHomeActive
                        ? 'bg-gray-100 dark:bg-slate-800/80 text-gray-950 dark:text-white font-bold'
                        : 'text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/70 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isHomeActive && !currentCategory ? 'text-white' : 'text-gray-700 dark:text-slate-300'}`} />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono-code px-2 py-0.5 rounded-md ${
                          isHomeActive && !currentCategory
                            ? 'bg-white/20 text-white font-semibold'
                            : 'bg-gray-200/70 text-gray-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHomeOpen((prev) => !prev);
                        }}
                        className="p-0.5 text-current hover:opacity-80 transition-opacity cursor-pointer"
                        aria-label="Toggle Home dropdown"
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            homeOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* ─── Category Topics Under Home Dropdown ─── */}
                  {homeOpen && (
                    <div className="ml-3 pl-3 border-l-2 border-gray-200 dark:border-slate-700 space-y-0.5 py-1">
                      {homeTopics.map((topic) => {
                        const isTopicActive =
                          (location.pathname === '/' || location.pathname.startsWith('/events')) &&
                          currentCategory === topic.value;

                        return (
                          <Link
                            key={topic.label}
                            to={topic.value ? `/?category=${topic.value}` : '/'}
                            onClick={onClose}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs tracking-tight transition-all ${
                              isTopicActive
                                ? 'bg-[#0B1528] dark:bg-blue-600 text-white font-bold shadow-2xs'
                                : 'text-gray-600 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/70 font-medium'
                            }`}
                          >
                            <span>{topic.label}</span>
                            {isTopicActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (item.name === 'Clubs') {
              const isClubsActive = location.pathname.startsWith('/clubs');
              const activeClubCategory = searchParams.get('category') || (searchParams.get('myClubs') === 'true' ? 'my-clubs' : '');

              return (
                <div key={item.name} className="space-y-1">
                  <div
                    onClick={() => {
                      setClubsOpen((prev) => !prev);
                      navigate('/clubs');
                      if (onClose && window.innerWidth < 768) onClose();
                    }}
                    className={`font-display flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm tracking-tight transition-all duration-150 cursor-pointer ${
                      isClubsActive && !activeClubCategory
                        ? 'bg-[#0B1528] dark:bg-blue-600 text-white font-bold shadow-xs'
                        : isClubsActive
                        ? 'bg-gray-100 dark:bg-slate-800/80 text-gray-950 dark:text-white font-bold'
                        : 'text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/70 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isClubsActive && !activeClubCategory ? 'text-white' : 'text-gray-700 dark:text-slate-300'}`} />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono-code px-2 py-0.5 rounded-md ${
                          isClubsActive && !activeClubCategory
                            ? 'bg-white/20 text-white font-semibold'
                            : 'bg-gray-200/70 text-gray-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClubsOpen((prev) => !prev);
                        }}
                        className="p-0.5 text-current hover:opacity-80 transition-opacity cursor-pointer"
                        aria-label="Toggle Clubs dropdown"
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            clubsOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* ─── Club Categories Dropdown ─── */}
                  {clubsOpen && (
                    <div className="ml-3 pl-3 border-l-2 border-gray-200 dark:border-slate-700 space-y-0.5 py-1">
                      {clubCategories.map((cat) => {
                        const isCatActive =
                          isClubsActive &&
                          ((cat.value === '' && !activeClubCategory) ||
                            (cat.value === activeClubCategory));

                        const targetUrl =
                          cat.value === ''
                            ? '/clubs'
                            : cat.value === 'my-clubs'
                            ? '/clubs?category=my-clubs'
                            : `/clubs?category=${cat.value}`;

                        return (
                          <Link
                            key={cat.label}
                            to={targetUrl}
                            onClick={onClose}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs tracking-tight transition-all ${
                              isCatActive
                                ? 'bg-[#0B1528] dark:bg-blue-600 text-white font-bold shadow-2xs'
                                : 'text-gray-600 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/70 font-medium'
                            }`}
                          >
                            <span>{cat.label}</span>
                            {isCatActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (item.name === 'Market') {
              const isMarketActive = location.pathname.startsWith('/market');
              const activeMarketCategory = searchParams.get('category') || (searchParams.get('myListings') === 'true' ? 'my-listings' : '');

              return (
                <div key={item.name} className="space-y-1">
                  <div
                    onClick={() => {
                      setMarketOpen((prev) => !prev);
                      navigate('/market');
                      if (onClose && window.innerWidth < 768) onClose();
                    }}
                    className={`font-display flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm tracking-tight transition-all duration-150 cursor-pointer ${
                      isMarketActive && !activeMarketCategory
                        ? 'bg-[#0B1528] dark:bg-blue-600 text-white font-bold shadow-xs'
                        : isMarketActive
                        ? 'bg-gray-100 dark:bg-slate-800/80 text-gray-950 dark:text-white font-bold'
                        : 'text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/70 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isMarketActive && !activeMarketCategory ? 'text-white' : 'text-gray-700 dark:text-slate-300'}`} />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono-code px-2 py-0.5 rounded-md ${
                          isMarketActive && !activeMarketCategory
                            ? 'bg-white/20 text-white font-semibold'
                            : 'bg-gray-200/70 text-gray-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMarketOpen((prev) => !prev);
                        }}
                        className="p-0.5 text-current hover:opacity-80 transition-opacity cursor-pointer"
                        aria-label="Toggle Market dropdown"
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            marketOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* ─── Market Categories Dropdown ─── */}
                  {marketOpen && (
                    <div className="ml-3 pl-3 border-l-2 border-gray-200 dark:border-slate-700 space-y-0.5 py-1">
                      {marketCategories.map((cat) => {
                        const isCatActive =
                          isMarketActive &&
                          ((cat.value === '' && !activeMarketCategory) ||
                            (cat.value === activeMarketCategory));

                        const targetUrl =
                          cat.value === ''
                            ? '/market'
                            : cat.value === 'my-listings'
                            ? '/market?category=my-listings'
                            : `/market?category=${cat.value}`;

                        return (
                          <Link
                            key={cat.label}
                            to={targetUrl}
                            onClick={onClose}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs tracking-tight transition-all ${
                              isCatActive
                                ? 'bg-[#0B1528] dark:bg-blue-600 text-white font-bold shadow-2xs'
                                : 'text-gray-600 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/70 font-medium'
                            }`}
                          >
                            <span>{cat.label}</span>
                            {isCatActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (item.name === 'Lost & Found') {
              const isLfActive = location.pathname.startsWith('/lostfound');
              const activeType = searchParams.get('type') || '';
              const activeCategory = searchParams.get('category') || '';

              return (
                <div key={item.name} className="space-y-1">
                  <div
                    onClick={() => {
                      setLostFoundOpen((prev) => !prev);
                      navigate('/lostfound');
                      if (onClose && window.innerWidth < 768) onClose();
                    }}
                    className={`font-display flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm tracking-tight transition-all duration-150 cursor-pointer ${
                      isLfActive && !activeType && !activeCategory
                        ? 'bg-[#0B1528] dark:bg-blue-600 text-white font-bold shadow-xs'
                        : isLfActive
                        ? 'bg-gray-100 dark:bg-slate-800/80 text-gray-950 dark:text-white font-bold'
                        : 'text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/70 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isLfActive && !activeType && !activeCategory ? 'text-white' : 'text-gray-700 dark:text-slate-300'}`} />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono-code px-2 py-0.5 rounded-md ${
                          isLfActive && !activeType && !activeCategory
                            ? 'bg-white/20 text-white font-semibold'
                            : 'bg-gray-200/70 text-gray-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLostFoundOpen((prev) => !prev);
                        }}
                        className="p-0.5 text-current hover:opacity-80 transition-opacity cursor-pointer"
                        aria-label="Toggle Lost & Found dropdown"
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            lostFoundOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* ─── Lost & Found Categories Dropdown ─── */}
                  {lostFoundOpen && (
                    <div className="ml-3 pl-3 border-l-2 border-gray-200 dark:border-slate-700 space-y-0.5 py-1">
                      {lostFoundCategories.map((cat) => {
                        const isCatActive =
                          isLfActive &&
                          ((cat.value === '' && !activeType && !activeCategory) ||
                            (cat.param === 'type' && activeType === cat.value) ||
                            (cat.param === 'category' && activeCategory === cat.value));

                        const targetUrl =
                          cat.value === ''
                            ? '/lostfound'
                            : cat.param === 'type'
                            ? `/lostfound?type=${cat.value}`
                            : `/lostfound?category=${cat.value}`;

                        return (
                          <Link
                            key={cat.label}
                            to={targetUrl}
                            onClick={onClose}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs tracking-tight transition-all ${
                              isCatActive
                                ? 'bg-[#0B1528] dark:bg-blue-600 text-white font-bold shadow-2xs'
                                : 'text-gray-600 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/70 font-medium'
                            }`}
                          >
                            <span>{cat.label}</span>
                            {isCatActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`font-display flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm tracking-tight transition-all duration-150 ${
                  active
                    ? 'bg-[#0B1528] dark:bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/70 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500 dark:text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono-code px-2 py-0.5 rounded-md ${
                      active
                        ? 'bg-white/20 text-white font-semibold'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Campus Assistant, Student Profile & Theme Toggle */}
      <div className="pt-3 border-t border-gray-200/90 dark:border-slate-800 px-1 space-y-2">
        {/* Campus Assistant right above Profile */}
        <Link
          to="/assistant"
          onClick={onClose}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer ${
            location.pathname === '/assistant'
              ? 'bg-[#0B1528] dark:bg-blue-600 text-white shadow-xs'
              : 'bg-gray-100/90 dark:bg-slate-800/80 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white border border-gray-200/80 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Campus Assistant</span>
          </div>
          <span
            className={`text-[10px] font-mono-code px-2 py-0.5 rounded-md ${
              location.pathname === '/assistant'
                ? 'bg-white/20 text-white font-semibold'
                : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
            }`}
          >
            AI 24/7
          </span>
        </Link>

        {user && (
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-100/80 dark:hover:bg-slate-800/70 transition-all group border border-transparent hover:border-gray-200/70 dark:hover:border-slate-700 flex-1 min-w-0"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-950 dark:text-white font-bold text-sm flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                {user.avatar ? (
                  <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <p className="font-bold text-sm text-gray-950 dark:text-white truncate group-hover:text-blue-500">
                {displayName}
              </p>
            </Link>

            {/* Quick Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to White Theme' : 'Switch to Dark Theme'}
              className="p-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:text-black dark:hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95 flex-shrink-0"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Desktop Fixed Left Sidebar ─── */}
      <aside className="hidden md:flex flex-col w-64 xl:w-72 bg-white dark:bg-[#0B111E] border-r border-gray-200/90 dark:border-slate-800 h-screen sticky top-0 shrink-0 p-4 z-30 overflow-y-auto transition-colors duration-200">
        <NavContent />
      </aside>

      {/* ─── Mobile Slide-out Drawer ─── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-white dark:bg-[#0B111E] p-4 shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <NavContent />
          </div>
        </div>
      )}
    </>
  );
}
