import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventService, chatService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Send,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
} from 'lucide-react';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEventById(id);
      setEvent(res.data.event);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const isOwner = user && event && (event.createdBy?._id || event.createdBy) === user._id;

  // Review applicant (Approve / Reject)
  const handleReview = async (applicantId, status) => {
    try {
      setActionLoading(true);
      await eventService.reviewApplicant(id, applicantId, status);
      fetchEvent();
    } catch (err) {
      alert(err.message || 'Failed to update applicant');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Chat with approved applicant
  const handleOpenChat = async (participantId) => {
    try {
      await chatService.openConversation(participantId, id);
      navigate('/chat');
    } catch (err) {
      alert(err.message || 'Could not open chat');
    }
  };

  // Toggle status open/closed
  const handleToggleStatus = async () => {
    try {
      const nextStatus = event.status === 'open' ? 'closed' : 'open';
      await eventService.updateEventStatus(id, nextStatus);
      fetchEvent();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Delete event
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await eventService.deleteEvent(id);
      navigate('/');
    } catch (err) {
      alert(err.message || 'Failed to delete event');
    }
  };

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await eventService.addComment(id, commentText);
      setCommentText('');
      fetchEvent();
    } catch (err) {
      alert(err.message || 'Failed to add comment');
    }
  };

  if (loading) return <LoadingSpinner message="Loading post details..." />;
  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Post not found</h2>
        <Link to="/" className="text-sm text-[#7C8592] hover:text-white transition-colors">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Posts</span>
      </button>

      {/* Main Post Card */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#E8F8F0] border border-[#05A86B]/30 text-[#05A86B] font-bold text-base sm:text-lg flex items-center justify-center flex-shrink-0 shadow-xs">
              {event.createdBy?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-950">{event.createdBy?.name}</h3>
              <p className="text-xs text-gray-500">
                {event.createdBy?.branch} • Semester {event.createdBy?.semester || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase px-2.5 sm:px-3 py-1 rounded-full bg-[#E8F8F0] text-[#05A86B] border border-[#05A86B]/30">
              {event.category}
            </span>
            <span
              className={`text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full capitalize border ${
                event.status === 'open'
                  ? 'bg-[#E8F8F0] text-[#05A86B] border-[#05A86B]/30'
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}
            >
              {event.status}
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-lg sm:text-2xl font-black text-gray-950 mb-2 sm:mb-3">{event.title}</h1>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>

        {/* Skills & Meta */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
          {event.skillsNeeded && event.skillsNeeded.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mr-4">
              {event.skillsNeeded.map((s, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200"
                >
                  #{s}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 ml-auto text-xs text-gray-500">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl font-medium text-gray-700">
              <Users className="w-4 h-4 text-[#05A86B]" />
              <span>
                {event.approvedCount || 0} / {event.teamSize} Teammates Filled
              </span>
            </div>

            {event.deadline && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl font-medium text-gray-700">
                <Clock className="w-4 h-4 text-[#D97706]" />
                <span>Due {new Date(event.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Owner Controls */}
        {isOwner && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={handleToggleStatus}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 transition-all cursor-pointer"
            >
              {event.status === 'open' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{event.status === 'open' ? 'Close Team Applications' : 'Re-open Applications'}</span>
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Post</span>
            </button>
          </div>
        )}
      </div>

      {/* Applicant Review Board (Owner only) */}
      {isOwner && (
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-950">
              Applicant Review ({event.applicants?.length || 0})
            </h2>
            <p className="text-xs text-gray-500">
              Accepting opens a direct chat thread with the applicant.
            </p>
          </div>

          {(!event.applicants || event.applicants.length === 0) ? (
            <p className="text-sm text-gray-500 py-4 italic">
              No students have applied yet. Your post is visible in the campus feed.
            </p>
          ) : (
            <div className="space-y-3">
              {event.applicants.map((app) => (
                <div
                  key={app._id}
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-950">
                        {app.user?.name || 'Applicant'}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-gray-700 border border-gray-200">
                        {app.user?.branch} • Sem {app.user?.semester}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          app.status === 'approved'
                            ? 'bg-[#E8F8F0] text-[#05A86B] border-[#05A86B]/30'
                            : app.status === 'rejected'
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-amber-50 text-[#D97706] border-amber-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 italic">"{app.message || 'Interested in joining!'}"</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {app.status === 'pending' && (
                      <>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleReview(app._id, 'approved')}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#05A86B] hover:bg-[#048E5A] text-white cursor-pointer transition-all shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleReview(app._id, 'rejected')}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    {app.status === 'approved' && (
                      <button
                        onClick={() => handleOpenChat(app.user?._id || app.user)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#E8F8F0] text-[#05A86B] border border-[#05A86B]/30 hover:bg-[#d4f2e3] transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Discussion & Comments */}
      <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-lg font-bold text-gray-950">
          Public Comments & Q&A ({event.comments?.length || 0})
        </h2>

        <div className="space-y-3">
          {(!event.comments || event.comments.length === 0) ? (
            <p className="text-sm text-gray-500 italic">No comments yet. Have a question? Ask below!</p>
          ) : (
            event.comments.map((c, i) => (
              <div key={i} className="flex gap-3 text-xs bg-gray-50 border border-gray-200 p-3.5 rounded-2xl">
                <div className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-900 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  {c.user?.name?.charAt(0) || 'U'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-950">{c.user?.name || 'Student'}</span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {user && (
          <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
            <input
              type="text"
              required
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Ask a question about the project or event..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white border-2 border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#05A86B]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#05A86B] hover:bg-[#048E5A] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-[#05A86B]/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Comment</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
