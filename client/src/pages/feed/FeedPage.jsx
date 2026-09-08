import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  ShoppingBag,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';

export default function FeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const categoryParam = searchParams.get('category') || '';
  const [category, setCategoryState] = useState(categoryParam);

  useEffect(() => {
    setCategoryState(categoryParam);
  }, [categoryParam]);

  const setCategory = (newCat) => {
    setCategoryState(newCat);
    const next = new URLSearchParams(searchParams);
    if (newCat) {
      next.set('category', newCat);
    } else {
      next.delete('category');
    }
    setSearchParams(next, { replace: true });
  };

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

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
  const [commentModalPost, setCommentModalPost] = useState(null);
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

  // Listen for create post shortcut from sidebar
  useEffect(() => {
    const handleOpen = () => setCreateModalOpen(true);
    window.addEventListener('open-create-post', handleOpen);
    return () => window.removeEventListener('open-create-post', handleOpen);
  }, []);

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
      const res = await eventService.addComment(eventId, commentText);
      const textAdded = commentText;
      setCommentText('');
      if (commentModalPost && commentModalPost._id === eventId) {
        setCommentModalPost((prev) => ({
          ...prev,
          comments: res.data?.comments || [
            ...(prev.comments || []),
            {
              user: { name: user?.name, avatar: user?.avatar },
              text: textAdded,
              createdAt: new Date(),
            },
          ],
        }));
      }
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to post comment');
    }
  };

  return (
    <div className="w-full max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* ─── Search & Actions Bar ─── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hackathons, project teams, skills, topics..."
            className="w-full pl-11 pr-5 py-3 sm:py-3.5 bg-white dark:bg-[#0E1626] border border-gray-200 dark:border-slate-800 hover:border-gray-400 dark:hover:border-slate-600 focus:border-[#0B1528] dark:focus:border-blue-500 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-200 shadow-2xs hover:shadow-sm"
          />
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          title="Create Post"
          className="flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-2xl bg-[#0B1528] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-98 shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Post</span>
        </button>
      </div>


      {feedback.message && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold'
              : 'bg-rose-50 border-rose-200 text-rose-600 font-semibold'
          }`}
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ─── Main Feed Posts (Full Width) ─── */}
      <div className="w-full space-y-4">
        {loading ? (
          <LoadingSpinner message="Fetching campus posts..." />
        ) : events.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 text-gray-900 flex items-center justify-center mx-auto shadow-xs">
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
              className="font-display inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0B1528] hover:bg-black text-white font-bold text-xs sm:text-sm tracking-tight transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Create Post
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5 w-full">
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

              // Category badge styling in soft pastel colors matching mockup
              const categoryStyle =
                post.category === 'hackathon'
                  ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#E0E7FF] dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60'
                  : post.category === 'cultural'
                  ? 'bg-[#FDF4FF] text-[#9333EA] border-[#F3E8FF] dark:bg-fuchsia-950/60 dark:text-fuchsia-300 dark:border-fuchsia-800/60'
                  : post.category === 'competition'
                  ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
                  : post.category === 'project'
                  ? 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD] dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60'
                  : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

              const isExpanded = !!expandedPosts[post._id];

              return (
                <div
                  key={post._id}
                  onClick={() => navigate(`/events/${post._id}`)}
                  className="w-full bg-white dark:bg-[#0E1626] border border-gray-300 dark:border-slate-800/90 hover:border-gray-400 dark:hover:border-slate-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 ease-out space-y-4 sm:space-y-5 shadow-xs hover:shadow-xl hover:-translate-y-1 group cursor-pointer"
                >
                  {/* Top: Title & Category Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      to={`/events/${post._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-lg sm:text-xl text-gray-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug tracking-tight"
                    >
                      {post.title}
                    </Link>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategory(post.category);
                      }}
                      title={`Filter by ${post.category}`}
                      className={`font-mono-code text-[10.5px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex-shrink-0 shadow-2xs cursor-pointer hover:brightness-95 transition-all ${categoryStyle}`}
                    >
                      {post.category}
                    </span>
                  </div>

                  {/* ─── Description & Inline See More ─── */}
                  <div className="space-y-2">
                    <div>
                      {post.description && (
                        <p
                          className={`text-sm text-gray-600 dark:text-slate-300 leading-relaxed font-normal ${
                            isExpanded ? 'whitespace-pre-line' : ''
                          }`}
                        >
                          {isExpanded
                            ? post.description
                            : (post.description.length > 200
                                ? `${post.description.slice(0, 200).trim()}...`
                                : post.description)}
                          {' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandPost(post._id);
                            }}
                            className="inline-flex items-center text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer select-none ml-1 align-baseline"
                          >
                            <span>{isExpanded ? 'show less' : 'see more'}</span>
                          </button>
                        </p>
                      )}
                      {!post.description && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandPost(post._id);
                          }}
                          className="text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer select-none"
                        >
                          {isExpanded ? 'show less' : 'see details'}
                        </button>
                      )}
                    </div>

                    {/* Expandable Meta Section */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-3 animate-fade-in">
                        {post.skillsNeeded && post.skillsNeeded.length > 0 && (
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">
                              Skills Required:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {post.skillsNeeded.map((skill, i) => (
                                <span
                                  key={i}
                                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200/80 dark:border-slate-700"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {post.deadline && (
                          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 font-semibold bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 px-3 py-1.5 rounded-xl w-fit">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Deadline: {new Date(post.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ─── Tags Pill Row ─── */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {post.skillsNeeded && post.skillsNeeded.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="font-medium text-xs px-2.5 py-1 rounded-lg bg-gray-100/80 dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200/60 dark:border-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                    {post.skillsNeeded && post.skillsNeeded.length > 3 && (
                      <span className="text-[11px] text-gray-600 dark:text-slate-400 font-semibold">
                        +{post.skillsNeeded.length - 3} more
                      </span>
                    )}

                    {post.teamSize && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300 bg-gray-100/70 dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700 px-2.5 py-1 rounded-lg font-medium ml-auto">
                        <Users className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                        <span>Team of {post.teamSize}</span>
                      </span>
                    )}
                  </div>

                  {/* ─── Bottom Footer: Poster Info & Actions ─── */}
                  <div className="pt-4 sm:pt-5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-4 text-xs text-gray-500 dark:text-slate-400">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 dark:from-slate-700 dark:to-slate-800 border border-gray-300 dark:border-slate-700 flex items-center justify-center font-bold text-gray-700 dark:text-slate-200 flex-shrink-0 text-xs shadow-2xs">
                        {post.createdBy?.name ? post.createdBy.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {post.createdBy?.name || 'Campus Student'}
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-slate-400 truncate">
                          {post.createdBy?.branch ? `${post.createdBy.branch} • ` : ''}
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Interested Heart / ThumbsUp Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInterest(post._id);
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                          post.interested && post.interested.includes(user?._id)
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 shadow-2xs'
                            : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                        }`}
                        title="Show Interest"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">
                          {post.interested?.length || 0}
                        </span>
                      </button>

                      {/* Comments Modal Trigger */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCommentModalPost(post);
                        }}
                        className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
                        title="View comments"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">
                          {post.comments?.length || 0}
                        </span>
                      </button>

                      {/* Apply Button */}
                      {isOwner ? (
                        <div className="ml-2 flex-shrink-0">
                          <Link
                            to={`/events/${post._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-display px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white border border-gray-300 dark:border-slate-700 transition-all inline-block whitespace-nowrap cursor-pointer"
                          >
                            Manage ({post.applicants?.length || 0})
                          </Link>
                        </div>
                      ) : hasApplied ? (
                        <div className="ml-2 flex-shrink-0">
                          <span
                            className={`font-mono-code px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 whitespace-nowrap border ${
                              myApplication?.status === 'accepted'
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : myApplication?.status === 'rejected'
                                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            {myApplication?.status === 'accepted' ? (
                              <>
                                <Check className="w-3 h-3 stroke-[3]" /> Accepted
                              </>
                            ) : (
                              myApplication?.status || 'Applied'
                            )}
                          </span>
                        </div>
                      ) : (
                        <div className="ml-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(post);
                              setApplyModalOpen(true);
                            }}
                            className="font-display px-4 py-2 rounded-xl text-xs font-bold tracking-tight bg-[#0B1528] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                          >
                            Apply Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0B1528] font-medium"
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
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0B1528] font-medium"
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
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#0B1528] cursor-pointer font-medium"
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
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#0B1528] font-medium"
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
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0B1528] font-medium"
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
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#0B1528] font-medium"
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
              className="font-display px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0B1528] hover:bg-black text-white shadow-md transition-all disabled:opacity-50 cursor-pointer active:scale-95 tracking-tight"
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
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0B1528] font-medium"
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
              className="font-display px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0B1528] hover:bg-black text-white shadow-md transition-all disabled:opacity-50 cursor-pointer active:scale-95 tracking-tight"
            >
              {actionLoading ? 'Sending...' : 'Send Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Comments / Discussion Modal ─── */}
      <Modal
        isOpen={!!commentModalPost}
        onClose={() => setCommentModalPost(null)}
        title={`Discussion (${commentModalPost?.comments?.length || 0})`}
        maxWidth="max-w-lg"
        isLight={true}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80">
            <h4 className="font-bold text-sm text-gray-950 line-clamp-1">{commentModalPost?.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Host: <span className="font-semibold text-gray-800">{commentModalPost?.createdBy?.name || 'Student'}</span>
            </p>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {commentModalPost?.comments && commentModalPost.comments.length > 0 ? (
              commentModalPost.comments.map((comment, idx) => (
                <div
                  key={idx}
                  className="flex gap-2.5 text-xs bg-white border border-gray-200/90 p-3 rounded-2xl shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-900 border border-gray-200 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    {comment.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <span className="font-bold text-gray-950">
                      {comment.user?.name || 'Student'}
                    </span>
                    <p className="text-gray-600 font-normal leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs text-gray-400">
                No comments yet. Start the conversation!
              </p>
            )}
          </div>

          {user && (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddComment(commentModalPost._id);
                  }
                }}
                placeholder="Ask a question or share a thought..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 font-normal"
              />
              <button
                onClick={() => handleAddComment(commentModalPost._id)}
                className="px-4 py-2.5 rounded-xl bg-[#0B1528] hover:bg-black text-white font-bold text-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
