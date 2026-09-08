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
      <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-xs flex flex-col md:flex-row h-[calc(100dvh-7.5rem)] md:h-[750px]">
        {/* Left Column: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-white ${
            activeConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0B1528]" />
              <h2 className="font-bold text-base text-gray-950">Direct Messages</h2>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
              {conversations.length}
            </span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loadingConvs ? (
              <LoadingSpinner message="Loading messages..." />
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm font-bold text-gray-900">No chats open yet</p>
                <p className="text-xs text-gray-500 leading-relaxed">
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
                      isSelected ? 'bg-gray-100 border-l-4 border-[#0B1528]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 text-gray-900 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {other?.name?.charAt(0) || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-sm font-bold text-gray-950 truncate">
                          {other?.name || 'Student'}
                        </h4>
                        <span className="text-[10px] text-gray-400">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ''}
                        </span>
                      </div>

                      {conv.event?.title && (
                        <p className="text-[11px] text-gray-700 truncate font-semibold">
                          Post: {conv.event.title}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 truncate mt-0.5">
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
          className={`flex-1 flex flex-col bg-[#FBFBFA] ${
            !activeConvId ? 'hidden md:flex items-center justify-center' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Active Conversation Topbar */}
              <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConvId(null)}
                    className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-gray-200 border border-gray-300 text-gray-900 font-bold text-sm flex items-center justify-center">
                    {getOtherParticipant(activeConv)?.name?.charAt(0) || 'U'}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-gray-950">
                      {getOtherParticipant(activeConv)?.name || 'Teammate'}
                    </h3>
                    <p className="text-[11px] text-gray-500">
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
                    <p className="text-xs text-gray-500">
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
                              ? 'bg-[#0B1528] text-white rounded-br-none shadow-xs font-medium'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-line">{m.text}</p>
                          <span
                            className={`block text-[10px] mt-1 ${
                              isMe ? 'text-gray-300 text-right' : 'text-gray-400'
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
                className="p-4 bg-white border-t border-gray-200 flex gap-2"
              >
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0B1528]"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="px-5 py-2.5 rounded-xl bg-[#0B1528] hover:bg-black text-white font-bold flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center p-8 space-y-3">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">Select a Conversation</h3>
              <p className="text-xs text-gray-500">
                Choose from the left pane to view discussions and collaborate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
