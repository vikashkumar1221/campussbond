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
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7C8592]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hackathons, project teams, competitions..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#121417] border border-[#20242B] rounded-xl text-xs sm:text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D] transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Category Dropdown */}
          <div className="relative flex-1 sm:flex-initial" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2.5 bg-[#121417] border border-[#20242B] hover:border-[#383F4D] rounded-xl text-xs sm:text-sm text-white transition-all cursor-pointer shadow-xs min-w-[180px]"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#7C8592]" />
                <span className="font-medium text-white truncate">
                  {categories.find((c) => c.value === category)?.label || 'All Topics'}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#7C8592] transition-transform duration-200 flex-shrink-0 ${
                  categoryDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full sm:w-56 bg-[#121417] border border-[#20242B] rounded-2xl p-1.5 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[#7C8592] tracking-wider border-b border-[#1E2228] mb-1">
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
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[#1C2027] text-white font-semibold'
                            : 'text-[#A6B0BC] hover:text-white hover:bg-[#181B20]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {c.value === 'hackathon' ? (
                            <span className="font-mono font-black text-xs text-[#60A5FA]">&lt;/&gt;</span>
                          ) : c.value === 'project' ? (
                            <Briefcase className="w-3.5 h-3.5 text-[#A78BFA]" />
                          ) : c.value === 'competition' ? (
                            <Trophy className="w-3.5 h-3.5 text-[#FBBF24]" />
                          ) : c.value === 'cultural' ? (
                            <Theater className="w-3.5 h-3.5 text-[#F472B6]" />
                          ) : c.value === 'other' ? (
                            <Sparkles className="w-3.5 h-3.5 text-[#94A3B8]" />
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

          {/* Create Post Button */}
          <button
            onClick={() => setCreateModalOpen(true)}
            title="Create Post"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#20242B] hover:bg-[#282D36] border border-[#2D333E] text-white text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 active:scale-98 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        </div>
      </div>

          {feedback.message && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs sm:text-sm animate-fade-in ${
                feedback.type === 'success'
                  ? 'bg-[#121E16] border-[#4ADE80]/30 text-[#4ADE80]'
                  : 'bg-[#251515] border-[#FF6B6B]/30 text-[#FF6B6B]'
              }`}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Feed List */}
          {loading ? (
            <LoadingSpinner message="Fetching posts..." />
          ) : events.length === 0 ? (
            <div className="bg-[#121417] border border-[#1E2228] rounded-2xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#1C1F26] border border-[#2B303A] text-[#7C8592] flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No posts found</h3>
              <p className="text-xs text-[#7C8592] max-w-sm mx-auto">
                {search || category
                  ? 'Try adjusting your search keywords or filter.'
                  : 'Be the first one to create a team post!'}
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#20242B] hover:bg-[#282D36] border border-[#2E3542] text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Post
              </button>
            </div>
          ) : (
            <div className="space-y-4">
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

                return (
                  <div
                    key={post._id}
                    className="bg-[#121417] border border-[#1E2228] hover:border-[#272C35] rounded-2xl p-5 sm:p-6 transition-all space-y-3 shadow-sm group"
                  >
                    {/* Top: Topic (Title) & Category */}
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        to={`/events/${post._id}`}
                        className="text-base sm:text-lg font-bold text-white hover:text-gray-200 transition-colors leading-snug"
                      >
                        {post.title}
                      </Link>
                      <span className="text-xs font-medium capitalize px-3 py-1 rounded-xl bg-[#181B20] text-[#A6B0BC] border border-[#242932] flex-shrink-0">
                        {post.category}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-[#7C8592] leading-relaxed line-clamp-2">
                      {post.description}
                    </p>

                    {/* Skills pills */}
                    {post.skillsNeeded && post.skillsNeeded.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {post.skillsNeeded.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#181B20] text-[#A6B0BC] border border-[#242932]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom row: Naam (Creator Avatar + Name + Branch + Date) on left, Comments & Apply on right */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1C1F26]">
                      {/* Creator Info (Niche) */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#1C1F26] border border-[#2B303A] text-white font-bold text-xs flex items-center justify-center overflow-hidden flex-shrink-0">
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
                            <h4 className="text-xs sm:text-sm font-semibold text-white">
                              {post.createdBy?.name || 'Aarav Sharma'}
                            </h4>
                            {post.createdBy?.branch && (
                              <span className="text-[11px] text-[#7C8592] font-medium">
                                {post.createdBy.branch}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#5C6572]">
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
                          className="flex items-center gap-1.5 text-xs text-[#7C8592] hover:text-white transition-colors cursor-pointer"
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
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#20242B] hover:bg-[#282D36] text-white border border-[#2D333E] transition-all inline-block"
                            >
                              Manage ({post.applicants?.length || 0})
                            </Link>
                          ) : hasApplied ? (
                            <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#181B20] text-[#A6B0BC] border border-[#242932] capitalize inline-block">
                              {myApplication?.status || 'Applied'}
                            </span>
                          ) : post.status === 'closed' ? (
                            <span className="text-xs text-[#7C8592]">Closed</span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedEvent(post);
                                setApplyModalOpen(true);
                              }}
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#20242B] hover:bg-[#282D36] text-white border border-[#2D333E] transition-all cursor-pointer active:scale-98"
                            >
                              Apply to Join
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inline Comments Drawer */}
                    {activeCommentPostId === post._id && (
                      <div className="pt-3 mt-2 border-t border-[#1E2228] space-y-3">
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {post.comments && post.comments.length > 0 ? (
                            post.comments.map((comment, idx) => (
                              <div key={idx} className="flex gap-2 text-xs bg-[#0F1114] border border-[#1E2228] p-2.5 rounded-xl">
                                <div className="w-6 h-6 rounded-full bg-[#1C1F26] text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                                  {comment.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-white">
                                    {comment.user?.name || 'Student'}
                                  </span>
                                  <p className="text-[#7C8592]">{comment.text}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-[#7C8592] italic">No comments yet.</p>
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
                              className="flex-1 px-3 py-2 rounded-xl bg-[#0F1114] border border-[#1E2228] text-xs text-white placeholder-[#687280] focus:outline-none focus:border-[#2D333E]"
                            />
                            <button
                              onClick={() => handleAddComment(post._id)}
                              className="px-3 py-2 rounded-xl bg-[#20242B] hover:bg-[#282D36] text-white border border-[#2D333E] cursor-pointer"
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

      {/* Create Team Post Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Team Formation Post"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Post Title
            </label>
            <input
              type="text"
              required
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="e.g. Smart India Hackathon: Need Frontend & ML Teammate"
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#7C8592]/50 focus:outline-none focus:border-[#3D4554]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Description & Requirements
            </label>
            <textarea
              required
              rows={3}
              value={newPost.description}
              onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
              placeholder="Describe the problem, hackathon theme, and what skills you are looking for..."
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#7C8592]/50 focus:outline-none focus:border-[#3D4554]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
                Category
              </label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white focus:outline-none focus:border-[#3D4554] cursor-pointer"
              >
                <option value="hackathon">Hackathon</option>
                <option value="project">Course / Capstone Project</option>
                <option value="competition">Competition</option>
                <option value="cultural">Cultural</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
                Teammates Needed
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={newPost.teamSize}
                onChange={(e) => setNewPost({ ...newPost, teamSize: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white focus:outline-none focus:border-[#3D4554]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Skills Needed (Comma-separated)
            </label>
            <input
              type="text"
              value={newPost.skillsNeeded}
              onChange={(e) => setNewPost({ ...newPost, skillsNeeded: e.target.value })}
              placeholder="React, Flutter, Python, Figma, Pitching"
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#7C8592]/50 focus:outline-none focus:border-[#3D4554]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Deadline (Optional)
            </label>
            <input
              type="date"
              value={newPost.deadline}
              onChange={(e) => setNewPost({ ...newPost, deadline: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white focus:outline-none focus:border-[#3D4554]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#A6B0BC] hover:text-white bg-[#181B20] border border-[#242932] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#20242B] hover:bg-[#282D36] text-white border border-[#2D333E] transition-all disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Apply to Team Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply to "${selectedEvent?.title}"`}
      >
        <form onSubmit={handleApply} className="space-y-4">
          <p className="text-xs text-[#7C8592]">
            Introduce yourself and tell the team owner why you're a good fit. If they accept your request, a direct chat will open!
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Pitch / Message
            </label>
            <textarea
              required
              rows={4}
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="Hi! I am a 3rd-year CSE student with strong React & Node experience. I have built 2 hackathon projects previously..."
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#7C8592]/50 focus:outline-none focus:border-[#3D4554]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#A6B0BC] bg-[#181B20] border border-[#242932] hover:text-white cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#20242B] hover:bg-[#282D36] text-white border border-[#2D333E] transition-all disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Sending...' : 'Send Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
