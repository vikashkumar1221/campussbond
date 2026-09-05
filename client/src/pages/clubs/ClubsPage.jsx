import React, { useState, useEffect, useRef } from 'react';
import { clubService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Users,
  Plus,
  Search,
  CheckCircle,
  UserPlus,
  UserMinus,
  Sparkles,
  Trash2,
  ChevronDown,
  Filter,
  Check,
  Theater,
  Music,
  Trophy,
  GraduationCap,
  Palette,
  Camera,
  Heart,
  MoreVertical,
} from 'lucide-react';

// Category Styling helper with clean monochrome text matching the dark theme
const getCategoryStyle = (category = '') => {
  const cat = (category || '').toLowerCase();
  switch (cat) {
    case 'tech':
      return {
        badge: 'bg-[#181B20] text-[#A6B0BC] border-[#242932]',
        label: 'Tech & Coding',
      };
    case 'cultural':
      return {
        badge: 'bg-[#181B20] text-[#A6B0BC] border-[#242932]',
        label: 'Cultural & Drama',
      };
    case 'sports':
      return {
        badge: 'bg-[#181B20] text-[#A6B0BC] border-[#242932]',
        label: 'Sports & Athletics',
      };
    case 'academic':
      return {
        badge: 'bg-[#181B20] text-[#A6B0BC] border-[#242932]',
        label: 'Academic & Research',
      };
    case 'arts':
      return {
        badge: 'bg-[#181B20] text-[#A6B0BC] border-[#242932]',
        label: 'Arts & Photography',
      };
    case 'social':
      return {
        badge: 'bg-[#181B20] text-[#A6B0BC] border-[#242932]',
        label: 'Social & NGO',
      };
    default:
      return {
        badge: 'bg-[#181B20] text-[#A6B0BC] border-[#242932]',
        label: 'Campus Club',
      };
  }
};

// Domain / Category Sign helper with 12x12 rounded-2xl monochrome dark container
const getClubSign = (category = '', name = '', image = null) => {
  if (image) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-[#181B20] border border-[#242932] overflow-hidden flex-shrink-0 shadow-xs flex items-center justify-center">
        <img
          src={image.startsWith('http') ? image : `${image}`}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const cat = (category || '').toLowerCase();
  const n = (name || '').toLowerCase();

  // Tech & Coding: </>
  if (
    cat === 'tech' ||
    n.includes('code') ||
    n.includes('coding') ||
    n.includes('program') ||
    n.includes('dev') ||
    n.includes('hack') ||
    n.includes('web') ||
    n.includes('ai') ||
    n.includes('cyber') ||
    n.includes('software') ||
    n.includes('tech')
  ) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-[#181B20] border border-[#242932] text-white flex items-center justify-center font-mono font-black text-sm tracking-tighter shadow-xs flex-shrink-0">
        &lt;/&gt;
      </div>
    );
  }

  // Cultural, Drama & Music
  if (
    cat === 'cultural' ||
    n.includes('drama') ||
    n.includes('theater') ||
    n.includes('theatre') ||
    n.includes('act') ||
    n.includes('nukkad') ||
    n.includes('music') ||
    n.includes('dance') ||
    n.includes('sing') ||
    n.includes('band')
  ) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-[#181B20] border border-[#242932] text-white flex items-center justify-center shadow-xs flex-shrink-0">
        {n.includes('music') || n.includes('sing') || n.includes('band') ? (
          <Music className="w-5 h-5 text-white" />
        ) : (
          <Theater className="w-5 h-5 text-white" />
        )}
      </div>
    );
  }

  // Sports & Athletics
  if (
    cat === 'sports' ||
    n.includes('sport') ||
    n.includes('cricket') ||
    n.includes('football') ||
    n.includes('athlet') ||
    n.includes('badminton') ||
    n.includes('fitness') ||
    n.includes('gym')
  ) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-[#181B20] border border-[#242932] text-white flex items-center justify-center shadow-xs flex-shrink-0">
        <Trophy className="w-5 h-5 text-white" />
      </div>
    );
  }

  // Academic & Research
  if (
    cat === 'academic' ||
    n.includes('research') ||
    n.includes('study') ||
    n.includes('science') ||
    n.includes('robot') ||
    n.includes('math') ||
    n.includes('physics') ||
    n.includes('innovat')
  ) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-[#181B20] border border-[#242932] text-white flex items-center justify-center shadow-xs flex-shrink-0">
        <GraduationCap className="w-5 h-5 text-white" />
      </div>
    );
  }

  // Arts & Photography
  if (
    cat === 'arts' ||
    n.includes('photo') ||
    n.includes('camera') ||
    n.includes('art') ||
    n.includes('design') ||
    n.includes('paint') ||
    n.includes('sketch') ||
    n.includes('film')
  ) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-[#181B20] border border-[#242932] text-white flex items-center justify-center shadow-xs flex-shrink-0">
        {n.includes('photo') || n.includes('camera') ? (
          <Camera className="w-5 h-5 text-white" />
        ) : (
          <Palette className="w-5 h-5 text-white" />
        )}
      </div>
    );
  }

  // Social & NGO
  if (
    cat === 'social' ||
    n.includes('social') ||
    n.includes('ngo') ||
    n.includes('volunteer') ||
    n.includes('rotaract') ||
    n.includes('help') ||
    n.includes('nature') ||
    n.includes('green')
  ) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-[#181B20] border border-[#242932] text-white flex items-center justify-center shadow-xs flex-shrink-0">
        <Heart className="w-5 h-5 text-white" />
      </div>
    );
  }

  // Default / Other
  return (
    <div className="w-12 h-12 rounded-2xl bg-[#181B20] border border-[#242932] text-white flex items-center justify-center shadow-xs flex-shrink-0">
      <Sparkles className="w-5 h-5 text-white" />
    </div>
  );
};

export default function ClubsPage() {
  const { user } = useAuth();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [onlyMyClubs, setOnlyMyClubs] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeMenuClubId, setActiveMenuClubId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (!event.target.closest('.club-menu-container')) {
        setActiveMenuClubId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal & form
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'tech',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;
      const res = await clubService.getClubs(params);
      setClubs(res.data.clubs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [categoryFilter, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      if (selectedFile) {
        data.append('image', selectedFile);
      }

      await clubService.createClub(data);
      setModalOpen(false);
      setFormData({ name: '', description: '', category: 'tech' });
      setSelectedFile(null);
      fetchClubs();
    } catch (err) {
      alert(err.message || 'Failed to create club');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      await clubService.joinClub(id);
      fetchClubs();
    } catch (err) {
      alert(err.message || 'Failed to join club');
    }
  };

  const handleLeave = async (id) => {
    try {
      await clubService.leaveClub(id);
      fetchClubs();
    } catch (err) {
      alert(err.message || 'Failed to leave club');
    }
  };

  const handleDelete = async (club) => {
    setActiveMenuClubId(null);
    const confirmed = window.confirm(
      `Are you sure you want to delete "${club.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await clubService.deleteClub(club._id);
      alert(`"${club.name}" has been deleted successfully.`);
      fetchClubs();
    } catch (err) {
      alert(err.message || 'Failed to delete club');
    } finally {
      setActionLoading(false);
    }
  };

  const categories = [
    { label: 'All Clubs', value: '' },
    { label: 'Tech & Coding', value: 'tech' },
    { label: 'Cultural & Drama', value: 'cultural' },
    { label: 'Sports & Athletics', value: 'sports' },
    { label: 'Academic & Research', value: 'academic' },
    { label: 'Arts & Photography', value: 'arts' },
    { label: 'Social & NGO', value: 'social' },
    { label: 'Other', value: 'other' },
  ];

  const myClubsCount = user
    ? clubs.filter((c) => (c.members || []).some((m) => (m._id || m) === user._id)).length
    : 0;

  const displayedClubs = onlyMyClubs && user
    ? clubs.filter((c) => (c.members || []).some((m) => (m._id || m) === user._id))
    : clubs;

  return (
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Interactive Top Hub (Minimal text, max interactivity) */}
      <div className="bg-[#121417] border border-[#1E2228] rounded-3xl p-5 sm:p-6 shadow-sm relative z-20 space-y-4">
        {/* Subtle ambient light with isolated overflow containment */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/[0.02] rounded-full blur-3xl" />
        </div>

        {/* Header Row: Title & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#181B20] border border-[#242932] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Clubs
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Interactive Toggle: All vs My Clubs */}
            <div className="inline-flex items-center bg-[#0C0E11] p-1 rounded-xl border border-[#1E2228]">
              <button
                type="button"
                onClick={() => setOnlyMyClubs(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !onlyMyClubs
                    ? 'bg-[#20242B] text-white shadow-xs'
                    : 'text-[#7C8592] hover:text-white'
                }`}
              >
                <span>All</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#14161A] text-[#A6B0BC]">
                  {clubs.length}
                </span>
              </button>

              {user && (
                <button
                  type="button"
                  onClick={() => setOnlyMyClubs(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    onlyMyClubs
                      ? 'bg-[#20242B] text-white shadow-xs'
                      : 'text-[#7C8592] hover:text-white'
                  }`}
                >
                  <span>My Clubs</span>
                  {myClubsCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white text-black">
                      {myClubsCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Register a Club Button */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black hover:bg-gray-200 font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register Club</span>
            </button>
          </div>
        </div>

        {/* Category Dropdown & Search Controls */}
        <div className="pt-3 border-t border-[#1A1D23] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
          {/* Category Dropdown */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2 bg-[#0C0E11] border border-[#1E2228] hover:border-[#383F4D] rounded-xl text-xs sm:text-sm text-white transition-all cursor-pointer shadow-xs min-w-[210px]"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#7C8592]" />
                <span className="font-medium text-white truncate">
                  {categories.find((c) => c.value === categoryFilter)?.label || 'All Clubs'}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#7C8592] transition-transform duration-200 flex-shrink-0 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-full sm:w-64 bg-[#121417] border border-[#20242B] rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[#7C8592] tracking-wider border-b border-[#1E2228] mb-1">
                  Filter by Category
                </div>
                <div className="max-h-64 overflow-y-auto space-y-0.5 scrollbar-none">
                  {categories.map((c) => {
                    const isSelected = categoryFilter === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => {
                          setCategoryFilter(c.value);
                          setOnlyMyClubs(false);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[#1C2027] text-white font-semibold'
                            : 'text-[#A6B0BC] hover:text-white hover:bg-[#181B20]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {c.value === 'tech' ? (
                            <span className="font-mono font-black text-xs text-[#A6B0BC]">&lt;/&gt;</span>
                          ) : c.value === 'cultural' ? (
                            <Theater className="w-3.5 h-3.5 text-[#A6B0BC]" />
                          ) : c.value === 'sports' ? (
                            <Trophy className="w-3.5 h-3.5 text-[#A6B0BC]" />
                          ) : c.value === 'academic' ? (
                            <GraduationCap className="w-3.5 h-3.5 text-[#A6B0BC]" />
                          ) : c.value === 'arts' ? (
                            <Palette className="w-3.5 h-3.5 text-[#A6B0BC]" />
                          ) : c.value === 'social' ? (
                            <Heart className="w-3.5 h-3.5 text-[#A6B0BC]" />
                          ) : c.value === 'other' ? (
                            <Sparkles className="w-3.5 h-3.5 text-[#A6B0BC]" />
                          ) : null}
                          <span>{c.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7C8592]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clubs..."
              className="w-full pl-9 pr-7 py-2 bg-[#0C0E11] border border-[#1E2228] focus:border-[#383F4D] rounded-xl text-xs text-white placeholder-[#687280] focus:outline-none transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#7C8592] hover:text-white cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner message="Loading clubs..." />
      ) : displayedClubs.length === 0 ? (
        <div className="bg-[#121417] border border-[#1E2228] rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <Users className="w-10 h-10 text-[#7C8592] mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-white">
            {onlyMyClubs ? "You haven't joined any clubs yet" : 'No clubs found'}
          </h3>
          <p className="text-xs sm:text-sm text-[#7C8592]">
            {onlyMyClubs
              ? "Browse all clubs and click 'Join Club' to get involved!"
              : 'Try searching with a different keyword or category.'}
          </p>
          {onlyMyClubs && (
            <button
              onClick={() => setOnlyMyClubs(false)}
              className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-all cursor-pointer"
            >
              Browse All Clubs
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayedClubs.map((club) => {
            const isCreator = Boolean(
              club.isAdmin ||
              (user && String(club.createdBy?._id || club.createdBy) === String(user._id))
            );
            const isMember =
              user &&
              (club.members || []).some(
                (m) => (m._id || m) === user._id
              );
            const catStyle = getCategoryStyle(club.category);

            return (
              <div
                key={club._id}
                className="bg-[#121417] border border-[#1E2228] hover:border-[#2D333E] rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-black/50 flex flex-col justify-between h-full group relative overflow-hidden shadow-xs"
              >
                {/* Upper Body */}
                <div className="p-5 sm:p-6 space-y-3.5 flex-1 flex flex-col">
                  {/* Top: Club Name at top with Domain Sign on left & Category badge on right */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="transition-transform duration-200 group-hover:scale-105 flex-shrink-0">
                        {getClubSign(club.category, club.name, club.image)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-gray-200 transition-colors leading-snug break-words line-clamp-1">
                          {club.name}
                        </h3>
                        <span className="text-[11px] text-[#7C8592] font-medium block mt-0.5">
                          {catStyle.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${catStyle.badge}`}>
                          {club.category}
                        </span>

                        {isCreator && (
                          <div className="relative club-menu-container">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuClubId(activeMenuClubId === club._id ? null : club._id);
                              }}
                              className="p-1 rounded-lg text-[#7C8592] hover:text-white hover:bg-[#1C2027] transition-colors cursor-pointer"
                              title="Options"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {activeMenuClubId === club._id && (
                              <div
                                className="absolute right-0 top-full mt-1 w-32 bg-[#16191E] border border-[#242932] rounded-xl shadow-2xl p-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(club);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#FF6B6B] hover:bg-[#251515] transition-colors text-left cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description with normalized height so all cards align symmetrically */}
                  <p className="text-xs sm:text-sm text-[#8A94A0] leading-relaxed line-clamp-2 min-h-[38px] flex-1">
                    {club.description || 'Official campus community for collaboration, technical discussions, and student activities.'}
                  </p>
                </div>

                {/* Footer Section: Surface shift, members count & actions */}
                <div className="px-5 sm:px-6 py-3.5 bg-[#0F1114]/70 border-t border-[#1A1D23] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#7C8592]">
                    <Users className="w-3.5 h-3.5 text-[#5B6370]" />
                    <span>
                      <strong className="text-white font-semibold">{club.memberCount || (club.members || []).length}</strong> members
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isMember ? (
                      <button
                        onClick={() => handleLeave(club._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#A6B0BC] hover:text-[#FF6B6B] bg-[#181B20] hover:bg-[#251515] transition-all cursor-pointer border border-[#242932] hover:border-[#FF6B6B]/30 active:scale-95"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Leave</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(club._id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#20242B] hover:bg-[#282D36] text-white border border-[#2D333E] hover:border-[#3E4554] transition-all cursor-pointer active:scale-95 shadow-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-white" />
                        <span>Join Club</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Club Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register a Campus Club or Society"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Club / Society Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. ACM Student Chapter or Campus Robotics Club"
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white focus:outline-none focus:border-[#383F4D] cursor-pointer"
            >
              <option value="tech">Tech & Coding</option>
              <option value="cultural">Cultural & Drama</option>
              <option value="sports">Sports & Athletics</option>
              <option value="academic">Academic & Research</option>
              <option value="arts">Arts & Photography</option>
              <option value="social">Social & NGO</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Description & Activities
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What this club does, regular meetups, activities..."
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Club Logo / Badge (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-xs text-[#7C8592] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#20242B] file:text-white hover:file:bg-[#282D36] cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7C8592] hover:text-white bg-[#181B20] border border-[#242932] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2 rounded-xl text-xs font-semibold bg-[#20242B] hover:bg-[#282D36] text-white border border-[#2D333E] transition-all disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Creating...' : 'Create Club'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
