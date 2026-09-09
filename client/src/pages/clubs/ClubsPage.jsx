import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { clubService, chatService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';
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
  MessageSquare,
  ExternalLink,
  Calendar,
} from 'lucide-react';

const getCategoryStyle = (category = '') => {
  const cat = (category || '').toLowerCase();
  switch (cat) {
    case 'tech':
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Tech & Coding',
      };
    case 'cultural':
      return {
        badge: 'bg-[#FDF2F8] text-[#D946EF] border-[#D946EF]/30',
        label: 'Cultural & Drama',
      };
    case 'sports':
      return {
        badge: 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]/30',
        label: 'Sports & Athletics',
      };
    case 'academic':
      return {
        badge: 'bg-[#EEF2FF] text-[#4F46E5] border-[#6366F1]/30',
        label: 'Academic & Research',
      };
    case 'arts':
      return {
        badge: 'bg-[#FDF2F8] text-[#D946EF] border-[#D946EF]/30',
        label: 'Arts & Photography',
      };
    case 'social':
      return {
        badge: 'bg-teal-50 text-teal-700 border-teal-200',
        label: 'Social & NGO',
      };
    default:
      return {
        badge: 'bg-gray-100 text-gray-700 border-gray-200',
        label: 'Campus Club',
      };
  }
};

const getClubSign = (category = '', name = '', image = null) => {
  if (image) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 shadow-xs flex items-center justify-center">
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
      <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-300 text-gray-950 flex items-center justify-center font-mono font-black text-sm tracking-tighter shadow-xs flex-shrink-0">
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
      <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] border border-[#D946EF]/20 text-[#D946EF] flex items-center justify-center shadow-xs flex-shrink-0">
        {n.includes('music') || n.includes('sing') || n.includes('band') ? (
          <Music className="w-5 h-5 text-[#D946EF]" />
        ) : (
          <Theater className="w-5 h-5 text-[#D946EF]" />
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
      <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] border border-[#F59E0B]/20 text-[#D97706] flex items-center justify-center shadow-xs flex-shrink-0">
        <Trophy className="w-5 h-5 text-[#D97706]" />
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
      <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] border border-[#6366F1]/20 text-[#4F46E5] flex items-center justify-center shadow-xs flex-shrink-0">
        <GraduationCap className="w-5 h-5 text-[#4F46E5]" />
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
      <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] border border-[#D946EF]/20 text-[#D946EF] flex items-center justify-center shadow-xs flex-shrink-0">
        {n.includes('photo') || n.includes('camera') ? (
          <Camera className="w-5 h-5 text-[#D946EF]" />
        ) : (
          <Palette className="w-5 h-5 text-[#D946EF]" />
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
      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-xs flex-shrink-0">
        <Heart className="w-5 h-5 text-teal-700" />
      </div>
    );
  }

  // Default / Other
  return (
    <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center shadow-xs flex-shrink-0">
      <Sparkles className="w-5 h-5 text-gray-600" />
    </div>
  );
};

export default function ClubsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get('category') || '';
  const urlIsMyClubs = searchParams.get('myClubs') === 'true' || urlCategory === 'my-clubs';

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState(urlIsMyClubs ? '' : urlCategory);
  const { searchQuery: search, debouncedSearch, setSearchQuery } = useSearch();
  const [onlyMyClubs, setOnlyMyClubs] = useState(urlIsMyClubs);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeMenuClubId, setActiveMenuClubId] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const dropdownRef = useRef(null);

  // Keep state in sync with URL searchParams
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const isMyClubs = searchParams.get('myClubs') === 'true' || cat === 'my-clubs';
    if (isMyClubs) {
      setOnlyMyClubs(true);
      setCategoryFilter('');
    } else {
      setOnlyMyClubs(false);
      setCategoryFilter(cat);
    }
  }, [searchParams]);

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
      if (selectedClub && selectedClub._id === id) {
        setSelectedClub((prev) => ({
          ...prev,
          members: [...(prev.members || []), user?._id || user],
          memberCount: (prev.memberCount || (prev.members || []).length) + 1,
        }));
      }
    } catch (err) {
      alert(err.message || 'Failed to join club');
    }
  };

  const handleLeave = async (id) => {
    try {
      await clubService.leaveClub(id);
      fetchClubs();
      if (selectedClub && selectedClub._id === id) {
        setSelectedClub((prev) => ({
          ...prev,
          members: (prev.members || []).filter((m) => (m._id || m) !== user?._id),
          memberCount: Math.max(0, (prev.memberCount || 1) - 1),
        }));
      }
    } catch (err) {
      alert(err.message || 'Failed to leave club');
    }
  };

  const handleMessageLead = async (club) => {
    const creatorId = club.createdBy?._id || club.createdBy;
    if (!creatorId) return;
    if (user && String(creatorId) === String(user._id)) {
      alert('You are the lead/creator of this club!');
      return;
    }
    try {
      await chatService.openConversation(creatorId);
      navigate('/chat');
    } catch (err) {
      alert(err.message || 'Could not open chat with club lead');
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


  const myClubsCount = user
    ? clubs.filter((c) => (c.members || []).some((m) => (m._id || m) === user._id)).length
    : 0;

  const displayedClubs = onlyMyClubs && user
    ? clubs.filter((c) => (c.members || []).some((m) => (m._id || m) === user._id))
    : clubs;

  return (
    <div className="w-full max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* ─── Category Filter Pills & Register Club Button ─── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { label: 'All Clubs', value: '' },
            { label: 'Tech & Coding', value: 'tech' },
            { label: 'Cultural & Drama', value: 'cultural' },
            { label: 'Sports & Athletics', value: 'sports' },
            { label: 'Academic & Research', value: 'academic' },
          ].map((tab) => {
            const isSelected = categoryFilter === tab.value && !onlyMyClubs;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setOnlyMyClubs(false);
                  setCategoryFilter(tab.value);
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#BCB5A3] text-[#1D1819] shadow-xs'
                    : 'bg-white dark:bg-[#0E1626] text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setModalOpen(true)}
          title="Register Club"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#E95E38] hover:bg-[#D7522D] text-white text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-98 shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Register Club</span>
        </button>
      </div>

      {/* Active Search Filter Banner */}
      {search && (
        <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-[#BCB5A3]/20 border border-[#BCB5A3]/40 text-xs sm:text-sm text-[#1D1819] dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#1D1819] dark:text-amber-300" />
            <span>Showing results for: <strong>"{search}"</strong></span>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold underline hover:opacity-80 cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* ─── Clubs Feed (Full Width, Matching Home) ─── */}
      <div className="w-full space-y-4">
        {loading ? (
          <LoadingSpinner message="Loading campus clubs..." />
        ) : displayedClubs.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center mx-auto shadow-xs">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-gray-950 tracking-tight">
              {onlyMyClubs ? "You haven't joined any clubs yet" : 'No clubs found'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto font-normal">
              {onlyMyClubs
                ? "Browse all clubs and click 'Join Club' to get involved!"
                : 'Try adjusting your search keywords or topic filter.'}
            </p>
            {onlyMyClubs ? (
              <button
                onClick={() => setOnlyMyClubs(false)}
                className="font-display inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0B1528] hover:bg-black text-white font-bold text-xs sm:text-sm tracking-tight transition-all shadow-md cursor-pointer active:scale-95"
              >
                Browse All Clubs
              </button>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="font-display inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0B1528] hover:bg-black text-white font-bold text-xs sm:text-sm tracking-tight transition-all shadow-md cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Register Club
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5 w-full">
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
                  onClick={() => setSelectedClub(club)}
                  className="w-full bg-white dark:bg-[#0E1626] border border-gray-300 dark:border-slate-800/90 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 ease-out space-y-4 sm:space-y-5 shadow-xs hover:shadow-xl hover:-translate-y-1 group cursor-pointer relative"
                >
                  {/* Top: Club Icon + Name & Category Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="transition-transform duration-200 group-hover:scale-105 flex-shrink-0">
                        {getClubSign(club.category, club.name, club.image)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg sm:text-xl text-gray-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug tracking-tight truncate">
                          {club.name}
                        </h3>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium block mt-0.5">
                          {catStyle.label}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono-code text-[10.5px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex-shrink-0 shadow-2xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700">
                      {club.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed font-normal">
                    {club.description || 'Official campus community for collaboration, technical discussions, and student activities.'}
                  </p>

                  {/* Tags / Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="font-medium text-xs px-2.5 py-1 rounded-lg bg-gray-100/80 dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200/60 dark:border-slate-700">
                      {catStyle.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300 bg-gray-100/70 dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700 px-2.5 py-1 rounded-lg font-medium ml-auto">
                      <Users className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                      <span>{club.memberCount || (club.members || []).length} Members</span>
                    </span>
                  </div>

                  {/* Bottom Footer: Lead / Creator info & Action Button */}
                  <div className="pt-4 sm:pt-5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-4 text-xs text-gray-500 dark:text-slate-400">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 dark:from-slate-700 dark:to-slate-800 border border-gray-300 dark:border-slate-700 flex items-center justify-center font-bold text-gray-700 dark:text-slate-200 flex-shrink-0 text-xs shadow-2xs">
                        {club.createdBy?.name ? club.createdBy.name[0].toUpperCase() : 'C'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {club.createdBy?.name ? `Led by ${club.createdBy.name}` : 'Campus Society'}
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-slate-400 truncate">
                          {club.createdAt ? new Date(club.createdAt).toLocaleDateString() : 'Active Society'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isCreator && (
                        <button
                          onClick={() => handleDelete(club)}
                          className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Club"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {isMember ? (
                        <button
                          onClick={() => handleLeave(club._id)}
                          className="font-display px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-gray-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-gray-200 dark:border-slate-700 hover:border-rose-200 transition-all cursor-pointer active:scale-95"
                        >
                          Joined (Leave)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoin(club._id)}
                          className="font-display px-5 py-2 rounded-xl text-xs font-bold tracking-tight bg-[#0B1528] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                        >
                          Join Club
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Club Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register a Campus Club or Society"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
              Club / Society Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. ACM Student Chapter or Campus Robotics Club"
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 focus:border-[#0B1528] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 focus:border-[#0B1528] rounded-xl text-sm text-gray-900 focus:outline-none cursor-pointer"
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
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
              Description & Activities
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What this club does, regular meetups, activities..."
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 focus:border-[#0B1528] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
              Club Logo / Badge (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-[#0B1528] hover:bg-black text-white transition-all disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-md"
            >
              {actionLoading ? 'Creating...' : 'Create Club'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Club Details Modal (Clickable Club Card) ─── */}
      {selectedClub && (
        <Modal
          isOpen={Boolean(selectedClub)}
          onClose={() => setSelectedClub(null)}
          title={selectedClub.name}
        >
          <div className="space-y-6">
            {/* Top: Icon + Title + Category Badge */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getClubSign(selectedClub.category, selectedClub.name, selectedClub.image)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-950 dark:text-white leading-tight">
                  {selectedClub.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="font-mono-code text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {getCategoryStyle(selectedClub.category).label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-medium">
                    <Users className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                    <span>{selectedClub.memberCount || (selectedClub.members || []).length} Members</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                About Club & Activities
              </h4>
              <p className="text-sm text-gray-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800">
                {selectedClub.description || 'Official campus community for collaboration, technical discussions, and student activities.'}
              </p>
            </div>

            {/* Club Leadership */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 flex items-center justify-center font-bold text-gray-900 dark:text-white text-sm flex-shrink-0">
                  {selectedClub.createdBy?.name ? selectedClub.createdBy.name[0].toUpperCase() : 'C'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Club Organizer / Lead</p>
                  <p className="text-sm font-bold text-gray-950 dark:text-white truncate">
                    {selectedClub.createdBy?.name || 'Campus Student Council'}
                  </p>
                </div>
              </div>

              {user && String(selectedClub.createdBy?._id || selectedClub.createdBy) !== String(user._id) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClub(null);
                    handleMessageLead(selectedClub);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/70 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/80 dark:border-blue-800/60 transition-all cursor-pointer flex-shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message Lead</span>
                </button>
              )}
            </div>

            {/* Bottom Actions: Join/Leave & Close */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <div>
                {Boolean(
                  selectedClub.isAdmin ||
                  (user && String(selectedClub.createdBy?._id || selectedClub.createdBy) === String(user._id))
                ) && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = selectedClub;
                      setSelectedClub(null);
                      handleDelete(c);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Club
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedClub(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 cursor-pointer"
                >
                  Close
                </button>

                {user && (selectedClub.members || []).some((m) => (m._id || m) === user._id) ? (
                  <button
                    type="button"
                    onClick={() => handleLeave(selectedClub._id)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 transition-all cursor-pointer active:scale-95"
                  >
                    Leave Club
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleJoin(selectedClub._id)}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0B1528] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    Join Club
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
