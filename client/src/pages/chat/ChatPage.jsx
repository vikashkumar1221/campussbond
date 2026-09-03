import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  MessageSquare,
  Send,
  User,
  Sparkles,
  ArrowLeft,
  Calendar,
  Layers,
} from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const res = await chatService.getConversations();
      const list = res.data.conversations || [];
      setConversations(list);
      if (list.length > 0 && !activeConvId) {
        setActiveConvId(list[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConvs(false);
    }
  };

  // Fetch messages for active conversation
  const fetchMessages = async (convId) => {
    if (!convId) return;
    try {
      const res = await chatService.getMessages(convId);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // When active conversation changes, load messages
  useEffect(() => {
    if (activeConvId) {
      setLoadingMessages(true);
      fetchMessages(activeConvId).finally(() => {
        setLoadingMessages(false);
        scrollToBottom();
      });
    }
  }, [activeConvId]);

  // Polling for active conversation every 4s to simulate real-time chat
  useEffect(() => {
    if (!activeConvId) return;
    const interval = setInterval(() => {
      fetchMessages(activeConvId);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConvId || sending) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      await chatService.sendMessage(activeConvId, textToSend);
      await fetchMessages(activeConvId);
      fetchConversations();
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c._id === activeConvId);

  // Helper to find the other participant
  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants) return null;
    return conv.participants.find((p) => p._id !== user?._id) || conv.participants[0];
  };

  return (
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="bg-[#1A1D21] border border-[#282D33] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row h-[calc(100dvh-7.5rem)] md:h-[750px]">
        {/* Left Column: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-[#282D33] flex flex-col bg-[#1A1D21] ${
            activeConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#282D33] flex items-center justify-between bg-[#1A1D21]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#E58A3C]" />
              <h2 className="font-bold text-base text-white">Direct Messages</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#23272D] text-[#8A94A0] border border-[#343A42]">
              {conversations.length}
            </span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#252A30]">
            {loadingConvs ? (
              <LoadingSpinner message="Loading messages..." />
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-[#8A94A0] mx-auto" />
                <p className="text-sm font-semibold text-white">No chats open yet</p>
                <p className="text-xs text-[#8A94A0] leading-relaxed">
                  When you approve team applicants on your posts, direct chats open here automatically!
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isSelected = conv._id === activeConvId;

                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConvId(conv._id)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#1E2228] border-l-2 border-[#E58A3C]' : 'hover:bg-[#23272D]/60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#23272D] border border-[#343A42] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {other?.name?.charAt(0) || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-sm font-bold text-white truncate">
                          {other?.name || 'Student'}
                        </h4>
                        <span className="text-[10px] text-[#8A94A0]">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ''}
                        </span>
                      </div>

                      {conv.event?.title && (
                        <p className="text-[11px] text-[#60A5FA] truncate font-medium">
                          Post: {conv.event.title}
                        </p>
                      )}

                      <p className="text-xs text-[#8A94A0] truncate mt-0.5">
                        {conv.lastMessage || 'Chat started'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat History & Input */}
        <div
          className={`flex-1 flex flex-col bg-[#131518] ${
            !activeConvId ? 'hidden md:flex items-center justify-center' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Active Conversation Topbar */}
              <div className="p-4 bg-[#1A1D21] border-b border-[#282D33] flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConvId(null)}
                    className="md:hidden p-1.5 rounded-lg text-[#8A94A0] hover:text-white cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-[#23272D] border border-[#343A42] text-white font-bold text-sm flex items-center justify-center">
                    {getOtherParticipant(activeConv)?.name?.charAt(0) || 'U'}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {getOtherParticipant(activeConv)?.name || 'Teammate'}
                    </h3>
                    <p className="text-[11px] text-[#8A94A0]">
                      {getOtherParticipant(activeConv)?.branch}
                      {activeConv.event?.title ? ` • ${activeConv.event.title}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-3">
                {loadingMessages ? (
                  <LoadingSpinner message="Fetching messages..." />
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <p className="text-xs text-[#8A94A0]">
                      Say hello to your new teammate! Discuss roles and project timelines.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = (m.sender?._id || m.sender) === user?._id;

                    return (
                      <div
                        key={m._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-[#E58A3C] text-white rounded-br-none shadow-md shadow-[#E58A3C]/20'
                              : 'bg-[#1A1D21] text-[#E6E9EC] border border-[#282D33] rounded-bl-none shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-line">{m.text}</p>
                          <span
                            className={`block text-[10px] mt-1 ${
                              isMe ? 'text-white/80 text-right' : 'text-[#8A94A0]'
                            }`}
                          >
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-[#1A1D21] border-t border-[#282D33] flex gap-2"
              >
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-[#131518] border border-[#282D33] rounded-2xl text-xs sm:text-sm text-white placeholder-[#8A94A0]/60 focus:outline-none focus:border-[#E58A3C]"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="px-5 py-3 rounded-2xl bg-[#E58A3C] hover:bg-[#D97724] text-white font-bold flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-[#E58A3C]/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center p-8 space-y-3">
              <MessageSquare className="w-12 h-12 text-[#8A94A0]/40 mx-auto" />
              <h3 className="text-base font-bold text-white">Select a Conversation</h3>
              <p className="text-xs text-[#8A94A0]">
                Choose from the left pane to view discussions and collaborate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
