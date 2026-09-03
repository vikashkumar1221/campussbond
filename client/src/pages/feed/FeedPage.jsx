import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  ChevronRight,
  AlertCircle,
  CheckCircle,
  ShoppingBag,
} from 'lucide-react';

export default function FeedPage() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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
    { label: 'All Categories', value: '' },
    { label: 'Hackathon', value: 'hackathon' },
    { label: 'Project Team', value: 'project' },
    { label: 'Competition', value: 'competition' },
    { label: 'Cultural', value: 'cultural' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Banner / Hero */}
          <div className="bg-[#1A1D21] border border-[#282D33] rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E7A43]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                Form Teams, Build Projects, Win Hackathons
              </h1>
              <p className="text-xs sm:text-sm text-[#8A94A0] max-w-xl leading-relaxed">
                Find teammates across departments with complementary skills.
              </p>
            </div>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="w-full sm:w-auto relative z-10 flex items-center justify-center gap-2 px-5 py-3 rounded-xl sm:rounded-2xl bg-[#1E7A43] hover:bg-[#166534] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#1E7A43]/20 flex-shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Create Team Post</span>
            </button>
          </div>

          {feedback.message && (
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 text-sm animate-fade-in ${
                feedback.type === 'success'
                  ? 'bg-[#16221A] border-[#4ADE80]/30 text-[#4ADE80]'
                  : 'bg-[#2B1818] border-[#3D2020] text-[#F87171]'
              }`}
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A0]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by topic, hackathon, or skills (e.g. React, Python)..."
                className="w-full pl-10 pr-4 py-3 bg-[#1A1D21] border border-[#282D33] rounded-2xl text-sm text-[#E6E9EC] placeholder-[#8A94A0]/60 focus:outline-none focus:border-[#E58A3C] transition-all shadow-xs"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    category === c.value
                      ? 'bg-[#1E2228] text-white border border-[#3A414A] shadow-xs font-bold'
                      : 'bg-[#1A1D21] border border-[#282D33] text-[#8A94A0] hover:text-white hover:border-[#383F47] shadow-2xs'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feed List */}
          {loading ? (
            <LoadingSpinner message="Fetching campus collaboration posts..." />
          ) : events.length === 0 ? (
            <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-12 text-center space-y-4 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#23272D] border border-[#343A42] text-[#8A94A0] flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No posts found</h3>
              <p className="text-sm text-[#8A94A0] max-w-sm mx-auto">
                {search || category
                  ? 'Try adjusting your filters or search keywords.'
                  : 'Be the first one to assemble a team for a hackathon or project!'}
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E7A43] text-white font-bold text-xs hover:bg-[#166534] transition-colors cursor-pointer shadow-md shadow-[#1E7A43]/20"
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
                    className="bg-[#1A1D21] border border-[#282D33] hover:border-[#383F47] rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all space-y-3 sm:space-y-4 shadow-md group"
                  >
                    {/* Post Creator Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#23272D] border border-[#343A42] text-white font-bold text-xs sm:text-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                          {post.createdBy?.avatar ? (
                            <img
                              src={post.createdBy.avatar}
                              alt={post.createdBy.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            post.createdBy?.name?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white flex flex-wrap items-center gap-1.5">
                            <span>{post.createdBy?.name || 'Anonymous Student'}</span>
                            {post.createdBy?.branch && (
                              <span className="text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#131518] text-[#8A94A0] border border-[#282D33]">
                                {post.createdBy.branch}
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-[#8A94A0]">
                            Posted {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span
                          className={`text-[10px] sm:text-xs font-semibold uppercase px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border ${
                            post.category === 'hackathon' || post.category === 'project'
                              ? 'bg-[#18261F] text-[#4ADE80] border-[#4ADE80]/30'
                              : post.category === 'competition'
                              ? 'bg-[#162238] text-[#60A5FA] border-[#60A5FA]/30'
                              : post.category === 'cultural'
                              ? 'bg-[#241B38] text-[#C084FC] border-[#C084FC]/30'
                              : 'bg-[#2B1818] text-[#FF6B6B] border-[#FF6B6B]/30'
                          }`}
                        >
                          {post.category}
                        </span>
                        {post.status === 'closed' && (
                          <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-[#2B1818] text-[#FF6B6B] border border-[#FF6B6B]/30">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Body */}
                    <div className="space-y-1.5">
                      <Link
                        to={`/events/${post._id}`}
                        className="text-base sm:text-lg font-bold text-white hover:text-[#E58A3C] transition-colors block leading-snug"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs sm:text-sm text-[#8A94A0] whitespace-pre-line leading-relaxed">
                        {post.description}
                      </p>
                    </div>

                    {/* Skills needed & Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      {post.skillsNeeded && post.skillsNeeded.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {post.skillsNeeded.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-[#131518] text-[#4ADE80] border border-[#282D33]"
                            >
                              #{skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#8A94A0]">
                        <div className="flex items-center gap-1 bg-[#131518] px-2.5 py-1 rounded-lg border border-[#282D33]">
                          <Users className="w-3.5 h-3.5 text-[#4ADE80]" />
                          <span>
                            {post.approvedCount || 0} / {post.teamSize} joined
                          </span>
                        </div>

                        {post.deadline && (
                          <div className="flex items-center gap-1 bg-[#131518] px-2.5 py-1 rounded-lg border border-[#282D33]">
                            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                            <span>Due {new Date(post.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#252A30]">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() => handleInterest(post._id)}
                          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-[#8A94A0] hover:text-[#E58A3C] hover:bg-[#23272D] transition-all cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Interested</span>
                        </button>

                        <button
                          onClick={() =>
                            setActiveCommentPostId(
                              activeCommentPostId === post._id ? null : post._id
                            )
                          }
                          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-[#8A94A0] hover:text-white hover:bg-[#23272D] transition-all cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Comments ({post.comments?.length || 0})</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOwner ? (
                          <Link
                            to={`/events/${post._id}`}
                            className="flex items-center gap-1 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-[#23272D] hover:bg-[#2C323A] text-white border border-[#282D33] transition-all"
                          >
                            <span>Manage ({post.applicants?.length || 0})</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : hasApplied ? (
                          <span
                            className={`text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl capitalize border ${
                              myApplication?.status === 'approved'
                                ? 'bg-[#18261F] text-[#4ADE80] border-[#4ADE80]/30'
                                : myApplication?.status === 'rejected'
                                ? 'bg-[#2B1818] text-[#FF6B6B] border-[#FF6B6B]/30'
                                : 'bg-[#2B2215] text-[#F59E0B] border-[#F59E0B]/30'
                            }`}
                          >
                            {myApplication?.status || 'Pending'}
                          </span>
                        ) : post.status === 'closed' ? (
                          <span className="text-xs text-[#8A94A0]">Team Full</span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedEvent(post);
                              setApplyModalOpen(true);
                            }}
                            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-[#1E7A43] hover:bg-[#166534] text-white transition-all shadow-md shadow-[#1E7A43]/20 cursor-pointer"
                          >
                            Apply to Join
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Comments Section */}
                    {activeCommentPostId === post._id && (
                      <div className="pt-4 mt-2 border-t border-[#252A30] space-y-3">
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {post.comments && post.comments.length > 0 ? (
                            post.comments.map((comment, idx) => (
                              <div key={idx} className="flex gap-2 text-xs bg-[#131518] border border-[#252A30] p-2.5 rounded-xl">
                                <div className="w-6 h-6 rounded-full bg-[#23272D] text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                                  {comment.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-white">
                                    {comment.user?.name || 'Student'}
                                  </span>
                                  <p className="text-[#8A94A0]">{comment.text}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-[#8A94A0] italic">No comments yet. Ask a question below!</p>
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
                              className="flex-1 px-3.5 py-2 rounded-xl bg-[#131518] border border-[#282D33] text-xs text-white placeholder-[#8A94A0]/60 focus:outline-none focus:border-[#E58A3C]"
                            />
                            <button
                              onClick={() => handleAddComment(post._id)}
                              className="p-2 rounded-xl bg-[#1E7A43] text-white hover:bg-[#166534] cursor-pointer shadow-sm"
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
        </div>

        {/* Right Sidebar Column (Sticky on Desktop) */}
        <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-24 self-start">
          {/* User Widget */}
          {user && (
            <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-6 space-y-4 shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#23272D] border border-[#343A42] text-white font-black text-base flex items-center justify-center flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-white truncate">{user.name}</h3>
                  <p className="text-xs text-[#8A94A0] truncate">
                    {user.branch || 'Campus Student'} • Sem {user.semester || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#131518] rounded-2xl flex items-center justify-between border border-[#282D33]">
                <span className="text-xs text-[#8A94A0] font-medium">Campus Score</span>
                <span className="text-sm font-black text-[#F59E0B] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                  {user.campusScore || 0} pts
                </span>
              </div>

              <Link
                to="/profile"
                className="block text-center py-2.5 rounded-xl text-xs font-bold text-white bg-[#1E2228] border border-[#2D333B] hover:border-[#E58A3C] hover:bg-[#23272D] transition-all shadow-2xs"
              >
                View Full Activity & Profile →
              </Link>
            </div>
          )}

          {/* In-Demand Skills Widget */}
          <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-6 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E58A3C]" />
                <span>Trending Skills</span>
              </h3>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-[11px] text-[#8A94A0] hover:text-white cursor-pointer"
                >
                  Clear filter
                </button>
              )}
            </div>
            <p className="text-xs text-[#8A94A0]">Click any skill tag to filter team posts</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['React', 'Python', 'AI/ML', 'PyTorch', 'UI/UX', 'Figma', 'Flutter', 'ROS', 'C++', 'Tailwind'].map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSearch(skill)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    search.toLowerCase() === skill.toLowerCase()
                      ? 'bg-[#1E7A43] text-white shadow-xs border border-[#1E7A43]'
                      : 'bg-[#131518] text-[#8A94A0] hover:text-[#4ADE80] hover:border-[#1E7A43]/40 border border-[#282D33]'
                  }`}
                >
                  #{skill}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts Widget */}
          <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-6 space-y-3 shadow-md">
            <h3 className="font-bold text-sm text-white">Campus Quick Access</h3>
            <div className="space-y-2">
              <Link
                to="/market"
                className="flex items-center justify-between p-3 rounded-2xl bg-[#131518] hover:bg-[#23272D] transition-colors group border border-[#252A30] hover:border-[#282D33]"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-xs font-semibold text-[#E6E9EC]">Student Marketplace</span>
                </div>
                <span className="text-xs text-[#8A94A0] group-hover:text-white transition-colors">Explore →</span>
              </Link>

              <Link
                to="/lostfound"
                className="flex items-center justify-between p-3 rounded-2xl bg-[#131518] hover:bg-[#23272D] transition-colors group border border-[#252A30] hover:border-[#282D33]"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-[#60A5FA]" />
                  <span className="text-xs font-semibold text-[#E6E9EC]">Lost & Found Board</span>
                </div>
                <span className="text-xs text-[#8A94A0] group-hover:text-white transition-colors">Explore →</span>
              </Link>

              <Link
                to="/clubs"
                className="flex items-center justify-between p-3 rounded-2xl bg-[#131518] hover:bg-[#23272D] transition-colors group border border-[#252A30] hover:border-[#282D33]"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#C084FC]" />
                  <span className="text-xs font-semibold text-[#E6E9EC]">Student Societies</span>
                </div>
                <span className="text-xs text-[#8A94A0] group-hover:text-white transition-colors">Explore →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Create Team Post Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Team Formation Post"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Post Title
            </label>
            <input
              type="text"
              required
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="e.g. Smart India Hackathon: Need Frontend & ML Teammate"
              className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/50 focus:outline-none focus:border-[#E58A3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Description & Requirements
            </label>
            <textarea
              required
              rows={3}
              value={newPost.description}
              onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
              placeholder="Describe the problem, hackathon theme, and what skills you are looking for..."
              className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/50 focus:outline-none focus:border-[#E58A3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
                Category
              </label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white focus:outline-none focus:border-[#E58A3C] cursor-pointer"
              >
                <option value="hackathon">Hackathon</option>
                <option value="project">Course / Capstone Project</option>
                <option value="competition">Competition</option>
                <option value="cultural">Cultural</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
                Teammates Needed
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={newPost.teamSize}
                onChange={(e) => setNewPost({ ...newPost, teamSize: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white focus:outline-none focus:border-[#E58A3C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Skills Needed (Comma-separated)
            </label>
            <input
              type="text"
              value={newPost.skillsNeeded}
              onChange={(e) => setNewPost({ ...newPost, skillsNeeded: e.target.value })}
              placeholder="React, Flutter, Python, Figma, Pitching"
              className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/50 focus:outline-none focus:border-[#E58A3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Deadline (Optional)
            </label>
            <input
              type="date"
              value={newPost.deadline}
              onChange={(e) => setNewPost({ ...newPost, deadline: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white focus:outline-none focus:border-[#E58A3C]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8A94A0] hover:text-white bg-[#23272D] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1E7A43] hover:bg-[#166534] text-white transition-all shadow-md shadow-[#1E7A43]/20 disabled:opacity-50 cursor-pointer"
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
          <p className="text-xs text-[#8A94A0]">
            Introduce yourself and tell the team owner why you're a good fit. If they accept your request, a direct chat will open!
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Pitch / Message
            </label>
            <textarea
              required
              rows={4}
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="Hi! I am a 3rd-year CSE student with strong React & Node experience. I have built 2 hackathon projects previously..."
              className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/50 focus:outline-none focus:border-[#1E7A43]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8A94A0] bg-[#23272D] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1E7A43] hover:bg-[#166534] text-white transition-all shadow-md shadow-[#1E7A43]/20 disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Sending...' : 'Send Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
