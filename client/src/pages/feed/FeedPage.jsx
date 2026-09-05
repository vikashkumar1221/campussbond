import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { eventService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Compass,
  Plus,
  Search,
  Filter,
  Users,
  Clock,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Send,
  Calendar,
  Layers,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Check,
  Trophy,
  Theater,
  Briefcase,
} from 'lucide-react';

export default function FeedPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-open create modal if navigated with ?create=true
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCreateModalOpen(true);
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  // Modals & form state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [expandedPosts, setExpandedPosts] = useState({});

  const toggleExpandPost = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    category: 'hackathon',
    skillsNeeded: '',
    teamSize: 2,
    deadline: '',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category) params.category = category;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await eventService.getEvents(params);
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, debouncedSearch]);

  // Handle Create Event
  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        ...newPost,
        teamSize: Number(newPost.teamSize),
        skillsNeeded: newPost.skillsNeeded
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        deadline: newPost.deadline || undefined,
      };
      await eventService.createEvent(payload);
      setCreateModalOpen(false);
      setNewPost({
        title: '',
        description: '',
        category: 'hackathon',
        skillsNeeded: '',
        teamSize: 2,
        deadline: '',
      });
      setFeedback({ type: 'success', message: 'Post published successfully!' });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to create post');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Apply to Event
  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    try {
      setActionLoading(true);
      await eventService.applyToEvent(selectedEvent._id, applyMessage);
      setApplyModalOpen(false);
      setApplyMessage('');
      setFeedback({ type: 'success', message: 'Your application has been sent to the poster!' });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to apply');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Interest toggle
  const handleInterest = async (eventId) => {
    try {
      await eventService.expressInterest(eventId);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  // Add comment
  const handleAddComment = async (eventId) => {
    if (!commentText.trim()) return;
    try {
      await eventService.addComment(eventId, commentText);
      setCommentText('');
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to post comment');
    }
  };

  const categories = [
    { label: 'All Topics', value: '' },
    { label: 'Hackathon', value: 'hackathon' },
    { label: 'Project Team', value: 'project' },
    { label: 'Competition', value: 'competition' },
    { label: 'Cultural', value: 'cultural' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 sm:space-y-5">
      {/* ─── Search & Filter Bar ─── */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hackathons, project teams, competitions..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 focus:border-[#05A86B] rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Category Dropdown */}
          <div className="relative flex-1 sm:flex-initial" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="font-display w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-2xl text-xs sm:text-sm text-gray-900 transition-all cursor-pointer shadow-xs min-w-[180px] font-bold tracking-tight"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span className="truncate">
                  {categories.find((c) => c.value === category)?.label || 'All Topics'}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                  categoryDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full sm:w-56 bg-white border-2 border-gray-200 rounded-2xl p-1.5 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="font-mono-code px-3 py-1.5 text-[10px] uppercase font-bold text-gray-500 tracking-wider border-b border-gray-100 mb-1">
                  Filter by Topic
                </div>
                <div className="max-h-60 overflow-y-auto space-y-0.5 scrollbar-none">
                  {categories.map((c) => {
                    const isSelected = category === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => {
                          setCategory(c.value);
                          setCategoryDropdownOpen(false);
                        }}
                        className={`font-display w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[#E8F8F0] text-[#05A86B] font-bold'
                            : 'text-gray-700 hover:text-black hover:bg-gray-50 font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {c.value === 'hackathon' ? (
                            <span className="font-mono-code font-black text-xs text-[#05A86B]">&lt;/&gt;</span>
                          ) : c.value === 'project' ? (
                            <Briefcase className="w-3.5 h-3.5 text-[#4F46E5]" />
                          ) : c.value === 'competition' ? (
                            <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                          ) : c.value === 'cultural' ? (
                            <Theater className="w-3.5 h-3.5 text-[#D946EF]" />
                          ) : c.value === 'other' ? (
                            <Sparkles className="w-3.5 h-3.5 text-gray-500" />
                          ) : null}
                          <span>{c.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#05A86B] flex-shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Create Post Button */}
          <button
            onClick={() => setCreateModalOpen(true)}
            title="Create Post"
            className="font-display flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#05A86B] hover:bg-[#048E5A] text-white text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer flex-shrink-0 active:scale-98 shadow-md shadow-[#05A86B]/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      {feedback.message && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-[#E8F8F0] border-[#05A86B]/30 text-[#05A86B] font-semibold'
              : 'bg-rose-50 border-rose-200 text-rose-600 font-semibold'
          }`}
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ─── Feed List ─── */}
      {loading ? (
        <LoadingSpinner message="Fetching campus posts..." />
      ) : events.length === 0 ? (
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F8F0] border border-[#05A86B]/25 text-[#05A86B] flex items-center justify-center mx-auto shadow-xs">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="font-display text-lg font-bold text-gray-950 tracking-tight">No posts found</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto font-normal">
            {search || category
              ? 'Try adjusting your search keywords or topic filter.'
              : 'Be the first one to create a team post for hackathons or projects!'}
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="font-display inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#05A86B] hover:bg-[#048E5A] text-white font-bold text-xs sm:text-sm tracking-tight transition-all shadow-md shadow-[#05A86B]/25 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Create Post
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {events.map((post) => {
            const isOwner = user && post.createdBy?._id === user._id;
            const hasApplied =
              user &&
              (post.applicants || []).some(
                (a) => (a.user?._id || a.user) === user._id
              );
            const myApplication =
              user &&
              (post.applicants || []).find(
                (a) => (a.user?._id || a.user) === user._id
              );

            // Category badge styling in Pitch Deck colors
            const categoryStyle =
              post.category === 'hackathon'
                ? 'bg-[#E8F8F0] text-[#05A86B] border-[#05A86B]/30'
                : post.category === 'cultural'
                ? 'bg-[#FDF2F8] text-[#D946EF] border-[#D946EF]/30'
                : post.category === 'competition'
                ? 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]/30'
                : post.category === 'project'
                ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#6366F1]/30'
                : 'bg-gray-100 text-gray-700 border-gray-200';

            const isExpanded = !!expandedPosts[post._id];

            return (
              <div
                key={post._id}
                className="bg-white border-2 border-gray-200/90 hover:border-gray-300 rounded-3xl p-5 sm:p-6 transition-all duration-200 space-y-3.5 shadow-xs hover:shadow-lg hover:shadow-gray-200/40 group"
              >
                {/* Top: Title & Category Badge */}
                <div className="flex items-start justify-between gap-4">
                  <Link
                    to={`/events/${post._id}`}
                    className="font-display font-extrabold text-lg sm:text-xl text-gray-950 group-hover:text-[#05A86B] transition-colors leading-snug tracking-[-0.02em]"
                  >
                    {post.title}
                  </Link>
                  <span
                    className={`font-mono-code text-[10.5px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex-shrink-0 shadow-2xs ${categoryStyle}`}
                  >
                    {post.category}
                  </span>
                </div>

                {/* ─── YouTube-style Clickable Description & Details Dropdown ─── */}
                <div className="space-y-2">
                  <div
                    onClick={() => toggleExpandPost(post._id)}
                    className="cursor-pointer group/desc rounded-2xl p-2.5 -mx-2.5 hover:bg-gray-50/80 transition-colors"
                  >
                    <p
                      className={`text-sm text-gray-600 leading-relaxed font-normal transition-all ${
                        isExpanded ? 'whitespace-pre-line' : 'line-clamp-2'
                      }`}
                    >
                      {post.description}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandPost(post._id);
                        }}
                        className="font-display inline-flex items-center gap-1 text-xs font-bold text-[#05A86B] hover:text-[#048E5A] transition-colors cursor-pointer"
                      >
                        <span>{isExpanded ? 'Show less' : '...more (See details)'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Full Details Panel */}
                  {isExpanded && (
                    <div className="mt-2 p-3.5 sm:p-4 rounded-2xl bg-gray-50/90 border border-gray-200/90 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        {/* 1. Teammates Needed */}
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                          <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#05A86B] flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono-code block">
                              Team Size
                            </span>
                            <span className="font-display font-bold text-gray-900">
                              {post.approvedCount || 0} / {post.teamSize || 2} Filled
                            </span>
                          </div>
                        </div>

                        {/* 2. Deadline */}
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                          <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono-code block">
                              Deadline
                            </span>
                            <span className="font-display font-bold text-gray-900">
                              {post.deadline
                                ? new Date(post.deadline).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'No strict deadline'}
                            </span>
                          </div>
                        </div>

                        {/* 3. Status & Applications */}
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              post.status === 'open' ? 'bg-[#E8F8F0] text-[#05A86B]' : 'bg-rose-50 text-rose-600'
                            }`}
                          >
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono-code block">
                              Status
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  post.status === 'open' ? 'bg-[#05A86B] animate-pulse' : 'bg-gray-400'
                                }`}
                              />
                              <span className="font-display font-bold capitalize text-gray-900">
                                {post.status === 'open' ? 'Open' : 'Closed'} ({post.applicants?.length || 0} applied)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Creator Academic Details & Full Link */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200/80 text-xs text-gray-600">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-500">Host:</span>
                          <span className="font-display font-bold text-gray-950">
                            {post.createdBy?.name || 'Student'}
                          </span>
                          {post.createdBy?.branch && (
                            <span className="font-mono-code text-[10.5px] font-semibold bg-gray-200/70 text-gray-800 px-2 py-0.5 rounded-md">
                              {post.createdBy.branch}
                            </span>
                          )}
                          {post.createdBy?.semester && (
                            <span className="text-gray-500 text-[11px]">
                              • Sem {post.createdBy.semester}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <Link
                            to={`/events/${post._id}`}
                            className="font-display inline-flex items-center gap-1 font-bold text-[#05A86B] hover:text-[#048E5A] hover:underline"
                          >
                            <span>Full Post Page</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleExpandPost(post._id)}
                            className="font-display text-xs font-semibold text-gray-500 hover:text-black cursor-pointer"
                          >
                            Show less
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Skills pills */}
                {post.skillsNeeded && post.skillsNeeded.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {post.skillsNeeded.map((skill, idx) => (
                      <span
                        key={idx}
                        className="font-mono-code text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-200/90 hover:bg-gray-100 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom row: Creator info on left, Comments & Apply on right */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                  {/* Creator Info */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E8F8F0] border border-[#05A86B]/30 text-[#05A86B] font-display font-extrabold text-xs flex items-center justify-center overflow-hidden flex-shrink-0">
                      {post.createdBy?.avatar ? (
                        <img
                          src={post.createdBy.avatar}
                          alt={post.createdBy.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        post.createdBy?.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-xs sm:text-sm font-bold text-gray-950 tracking-tight">
                          {post.createdBy?.name || 'Student'}
                        </h4>
                        {post.createdBy?.branch && (
                          <span className="font-mono-code text-[10px] text-gray-600 font-semibold bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200/60">
                            {post.createdBy.branch}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium tracking-normal">
                        {new Date(post.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Comments & Apply Action */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button
                      onClick={() =>
                        setActiveCommentPostId(
                          activeCommentPostId === post._id ? null : post._id
                        )
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>
                        {post.comments?.length || 0}{' '}
                        {post.comments?.length === 1 ? 'comment' : 'comments'}
                      </span>
                    </button>

                    <div>
                      {isOwner ? (
                        <Link
                          to={`/events/${post._id}`}
                          className="font-display px-4 py-2 rounded-xl text-xs font-bold tracking-tight bg-gray-950 hover:bg-black text-white transition-all inline-block shadow-xs"
                        >
                          Manage ({post.applicants?.length || 0})
                        </Link>
                      ) : hasApplied ? (
                        <span className="font-display px-4 py-2 rounded-xl text-xs font-bold tracking-tight bg-[#FDF2F8] text-[#D946EF] border border-[#D946EF]/30 capitalize inline-block">
                          {myApplication?.status || 'Applied'}
                        </span>
                      ) : post.status === 'closed' ? (
                        <span className="text-xs text-gray-400 font-semibold">Closed</span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedEvent(post);
                            setApplyModalOpen(true);
                          }}
                          className="font-display px-4 py-2 rounded-xl text-xs font-bold tracking-tight bg-[#05A86B] hover:bg-[#048E5A] text-white shadow-xs hover:shadow-md hover:shadow-[#05A86B]/20 transition-all cursor-pointer active:scale-95"
                        >
                          Apply to Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inline Comments Drawer */}
                {activeCommentPostId === post._id && (
                  <div className="pt-3 mt-2 border-t border-gray-100 space-y-3 bg-gray-50/70 p-3 rounded-2xl">
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment, idx) => (
                          <div
                            key={idx}
                            className="flex gap-2 text-xs bg-white border border-gray-200/90 p-2.5 rounded-xl shadow-2xs"
                          >
                            <div className="w-6 h-6 rounded-full bg-[#E8F8F0] text-[#05A86B] font-display font-extrabold flex items-center justify-center flex-shrink-0 text-[10px]">
                              {comment.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-display font-bold text-gray-950 tracking-tight">
                                {comment.user?.name || 'Student'}
                              </span>
                              <p className="text-gray-600 font-normal leading-relaxed">{comment.text}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">No comments yet.</p>
                      )}
                    </div>

                    {user && (
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                          placeholder="Ask a question or comment..."
                          className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#05A86B] font-normal"
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          className="px-3.5 py-2 rounded-xl bg-[#05A86B] hover:bg-[#048E5A] text-white font-bold cursor-pointer transition-all active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Create Team Post Modal ─── */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Team Formation Post"
        maxWidth="max-w-xl"
        isLight={true}
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="font-display block text-xs font-bold text-gray-700 uppercase mb-1.5 tracking-wider">
              Post Title
            </label>
            <input
              type="text"
              required
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="e.g. Smart India Hackathon: Need Frontend & ML Teammate"
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#05A86B] font-medium"
            />
          </div>

          <div>
            <label className="font-display block text-xs font-bold text-gray-700 uppercase mb-1.5 tracking-wider">
              Description &amp; Requirements
            </label>
            <textarea
              required
              rows={3}
              value={newPost.description}
              onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
              placeholder="Describe the problem, hackathon theme, and what skills you are looking for..."
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#05A86B] font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-display block text-xs font-bold text-gray-700 uppercase mb-1.5 tracking-wider">
                Category
              </label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#05A86B] cursor-pointer font-medium"
              >
                <option value="hackathon">Hackathon</option>
                <option value="project">Course / Capstone Project</option>
                <option value="competition">Competition</option>
                <option value="cultural">Cultural</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-display block text-xs font-bold text-gray-700 uppercase mb-1.5 tracking-wider">
                Teammates Needed
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={newPost.teamSize}
                onChange={(e) => setNewPost({ ...newPost, teamSize: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#05A86B] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-display block text-xs font-bold text-gray-700 uppercase mb-1.5 tracking-wider">
              Skills Needed (Comma-separated)
            </label>
            <input
              type="text"
              value={newPost.skillsNeeded}
              onChange={(e) => setNewPost({ ...newPost, skillsNeeded: e.target.value })}
              placeholder="React, Flutter, Python, Figma, Pitching"
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#05A86B] font-medium"
            />
          </div>

          <div>
            <label className="font-display block text-xs font-bold text-gray-700 uppercase mb-1.5 tracking-wider">
              Deadline (Optional)
            </label>
            <input
              type="date"
              value={newPost.deadline}
              onChange={(e) => setNewPost({ ...newPost, deadline: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#05A86B] font-medium"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="font-display px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors tracking-tight"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="font-display px-6 py-2.5 rounded-xl text-xs font-bold bg-[#05A86B] hover:bg-[#048E5A] text-white shadow-md shadow-[#05A86B]/25 transition-all disabled:opacity-50 cursor-pointer active:scale-95 tracking-tight"
            >
              {actionLoading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Apply to Team Modal ─── */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply to "${selectedEvent?.title}"`}
        isLight={true}
      >
        <form onSubmit={handleApply} className="space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed font-normal">
            Introduce yourself and tell the team owner why you&apos;re a good fit. If they accept your request, a direct chat will open!
          </p>
          <div>
            <label className="font-display block text-xs font-bold text-gray-700 uppercase mb-1.5 tracking-wider">
              Pitch / Message
            </label>
            <textarea
              required
              rows={4}
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="Hi! I am a 3rd-year CSE student with strong React & Node experience. I have built 2 hackathon projects previously..."
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#05A86B] font-medium"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="font-display px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors tracking-tight"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="font-display px-6 py-2.5 rounded-xl text-xs font-bold bg-[#05A86B] hover:bg-[#048E5A] text-white shadow-md shadow-[#05A86B]/25 transition-all disabled:opacity-50 cursor-pointer active:scale-95 tracking-tight"
            >
              {actionLoading ? 'Sending...' : 'Send Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
