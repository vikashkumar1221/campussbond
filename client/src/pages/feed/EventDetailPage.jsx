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
        <h2 className="text-xl font-bold">Post not found</h2>
        <Link to="/" className="text-sm text-[#15532E] hover:underline">
          ← Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#8A94A0] hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main Post Card */}
      <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#23272D] border border-[#343A42] text-white font-black text-lg flex items-center justify-center flex-shrink-0">
              {event.createdBy?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-white">{event.createdBy?.name}</h3>
              <p className="text-xs text-[#8A94A0]">
                {event.createdBy?.branch} • Semester {event.createdBy?.semester || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase px-3 py-1 rounded-full bg-[#162238] text-[#60A5FA] border border-[#60A5FA]/30">
              {event.category}
            </span>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full capitalize border ${
                event.status === 'open'
                  ? 'bg-[#18261F] text-[#4ADE80] border-[#4ADE80]/30'
                  : 'bg-[#2B1818] text-[#FF6B6B] border-[#FF6B6B]/30'
              }`}
            >
              {event.status}
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black text-white mb-3">{event.title}</h1>
          <p className="text-sm text-[#8A94A0] leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>

        {/* Skills & Meta */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#252A30]">
          {event.skillsNeeded && event.skillsNeeded.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mr-4">
              {event.skillsNeeded.map((s, i) => (
                <span
                  key={i}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#131518] text-[#E58A3C] border border-[#282D33]"
                >
                  #{s}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 ml-auto text-xs text-[#8A94A0]">
            <div className="flex items-center gap-1.5 bg-[#131518] border border-[#282D33] px-3 py-1.5 rounded-xl">
              <Users className="w-4 h-4 text-[#4ADE80]" />
              <span>
                {event.approvedCount || 0} / {event.teamSize} Teammates Filled
              </span>
            </div>

            {event.deadline && (
              <div className="flex items-center gap-1.5 bg-[#131518] border border-[#282D33] px-3 py-1.5 rounded-xl">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                <span>Due {new Date(event.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Owner Controls */}
        {isOwner && (
          <div className="flex items-center justify-between pt-4 border-t border-[#252A30]">
            <button
              onClick={handleToggleStatus}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#23272D] hover:bg-[#2C323A] text-white border border-[#282D33] transition-all cursor-pointer"
            >
              {event.status === 'open' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{event.status === 'open' ? 'Close Team Applications' : 'Re-open Applications'}</span>
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#F87171] bg-[#2B1818] hover:bg-[#381E1E] border border-[#3D2020] transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Post</span>
            </button>
          </div>
        )}
      </div>

      {/* Applicant Review Board (Owner only) */}
      {isOwner && (
        <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Applicant Review ({event.applicants?.length || 0})
            </h2>
            <p className="text-xs text-[#8A94A0]">
              Accepting opens a direct chat thread with the applicant.
            </p>
          </div>

          {(!event.applicants || event.applicants.length === 0) ? (
            <p className="text-sm text-[#8A94A0] py-4 italic">
              No students have applied yet. Your post is visible in the campus feed.
            </p>
          ) : (
            <div className="space-y-3">
              {event.applicants.map((app) => (
                <div
                  key={app._id}
                  className="bg-[#131518] border border-[#282D33] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {app.user?.name || 'Applicant'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#23272D] text-[#8A94A0] border border-[#343A42]">
                        {app.user?.branch} • Sem {app.user?.semester}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          app.status === 'approved'
                            ? 'bg-[#18261F] text-[#4ADE80] border-[#4ADE80]/30'
                            : app.status === 'rejected'
                            ? 'bg-[#2B1818] text-[#FF6B6B] border-[#FF6B6B]/30'
                            : 'bg-[#2B2215] text-[#F59E0B] border-[#F59E0B]/30'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#8A94A0] italic">"{app.message || 'Interested in joining!'}"</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {app.status === 'pending' && (
                      <>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleReview(app._id, 'approved')}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#E58A3C] hover:bg-[#D97724] text-white cursor-pointer shadow-md shadow-[#E58A3C]/20"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleReview(app._id, 'rejected')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#F87171] bg-[#2B1818] hover:bg-[#381E1E] border border-[#3D2020] cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    {app.status === 'approved' && (
                      <button
                        onClick={() => handleOpenChat(app.user?._id || app.user)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#23272D] text-white border border-[#282D33] hover:border-[#E58A3C] transition-all cursor-pointer"
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
      <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
        <h2 className="text-lg font-bold text-white">
          Public Comments & Q&A ({event.comments?.length || 0})
        </h2>

        <div className="space-y-3">
          {(!event.comments || event.comments.length === 0) ? (
            <p className="text-sm text-[#8A94A0] italic">No comments yet. Have a question? Ask below!</p>
          ) : (
            event.comments.map((c, i) => (
              <div key={i} className="flex gap-3 text-xs bg-[#131518] border border-[#252A30] p-3 rounded-2xl">
                <div className="w-7 h-7 rounded-full bg-[#23272D] border border-[#343A42] text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  {c.user?.name?.charAt(0) || 'U'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{c.user?.name || 'Student'}</span>
                    <span className="text-[10px] text-[#8A94A0]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[#8A94A0] leading-relaxed">{c.text}</p>
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#131518] border border-[#282D33] text-sm text-white placeholder-[#8A94A0]/60 focus:outline-none focus:border-[#E58A3C]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#E58A3C] hover:bg-[#D97724] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#E58A3C]/20"
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
