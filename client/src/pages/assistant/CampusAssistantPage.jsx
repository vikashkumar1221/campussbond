import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  RotateCcw,
  ArrowRight,
  Compass,
  ShoppingBag,
  Search,
  Users,
  GraduationCap,
  Wifi,
  Code2,
} from 'lucide-react';
import { assistantService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STORAGE_KEY = 'campus_bond_chatbot_history';

const getInitialGreeting = (name = 'Vikash') => ({
  id: 'msg-welcome',
  sender: 'bot',
  text: `Hey ${name}, I am your Campus Assistant!\n\nAsk me anything about these direct processes:\n\n1. **Hackathons:** How to find teammates or create a team post.\n2. **Marketplace:** How to buy or sell second-hand books and notes.\n3. **Lost & Found:** How to report lost belongings or check found items.\n4. **Clubs:** How to join societies or contact club leads.\n5. **Academics:** 75% attendance rule, Wi-Fi credentials, and library timings.`,
  actions: [
    { label: '🚀 Hackathons Feed', url: '/?category=hackathon' },
    { label: '🛍️ Open Market', url: '/market' },
    { label: '🔍 Lost & Found', url: '/lostfound' },
    { label: '🏛️ Explore Clubs', url: '/clubs' },
  ],
  timestamp: new Date().toISOString(),
});

const TOPIC_CARDS = [
  {
    icon: Compass,
    title: 'Hackathons & Teams',
    query: 'How to find teammates for hackathons and projects?',
    desc: 'Process to form teams and find project partners',
  },
  {
    icon: ShoppingBag,
    title: 'Campus Marketplace',
    query: 'How to buy or sell books in Market?',
    desc: 'Process to buy/sell used books, notes & kits',
  },
  {
    icon: Search,
    title: 'Lost & Found',
    query: 'I lost my keys or ID card on campus, what should I do?',
    desc: 'Process to report lost items or deposit found items',
  },
  {
    icon: Users,
    title: 'Campus Clubs',
    query: 'How to join clubs or contact club leads?',
    desc: 'Process to join societies or contact leads',
  },
  {
    icon: GraduationCap,
    title: '75% Attendance & Exams',
    query: 'What is the 75% attendance rule and exam policy?',
    desc: 'Attendance policy, medical leave and exam rules',
  },
  {
    icon: Wifi,
    title: 'Library & Wi-Fi',
    query: 'What are library timings and how to connect to campus Wi-Fi?',
    desc: 'Wi-Fi connection credentials and library hours',
  },
  {
    icon: Code2,
    title: 'DSA & Placements',
    query: 'How to prepare for placements and DSA roadmap?',
    desc: 'Placement preparation and project roadmap',
  },
];

export default function CampusAssistantPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const studentFirstName = user?.name ? user.name.split(' ')[0] : 'Vikash';

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [getInitialGreeting(studentFirstName)];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Save history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await assistantService.ask(query, studentFirstName);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.data?.answer || `Hey ${studentFirstName}, I am ready to help you with any campus process.`,
        actions: res.data?.actions || [],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Client knowledge fallback with personal greeting & step-by-step process in English
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Hey ${studentFirstName}, here is the direct process for "${query}":\n\n1. **Campus Feed:** Post on the Feed to find project teammates or campus advice.\n2. **Marketplace:** Check Market to buy or list second-hand books and notes.\n3. **Lost & Found:** Report lost belongings with the location you last saw them.`,
        actions: [
          { label: '🏠 Campus Feed', url: '/' },
          { label: '🛍️ Market', url: '/market' },
          { label: '🏛️ Explore Clubs', url: '/clubs' },
        ],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleResetChat = () => {
    if (window.confirm('Clear all conversation history?')) {
      setMessages([getInitialGreeting(studentFirstName)]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleActionClick = (action) => {
    if (action.triggerCreate) {
      window.dispatchEvent(new CustomEvent('open-create-post'));
    }
    if (action.triggerQuery) {
      handleSendMessage(action.triggerQuery);
      return;
    }
    if (action.url) {
      navigate(action.url);
    }
  };

  // Clean formatting without duplicate bullets (removes double bullet • • issue)
  const renderFormattedText = (rawText = '') => {
    const lines = rawText.split('\n');

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ');
      const cleanContent = isBullet ? trimmed.replace(/^[•\-\*]\s*/, '') : trimmed;

      const parts = cleanContent.split(/(\*\*.*?\*\*|\*.*?\*)/g);

      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-gray-950 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <em key={pIdx} className="italic text-gray-800 dark:text-slate-200">
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2.5 my-1 pl-1">
            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-0.5">•</span>
            <div className="flex-1 leading-relaxed text-sm sm:text-base">{formattedLine}</div>
          </div>
        );
      }

      const matchNum = cleanContent.match(/^(\d+)\.\s*(.*)/);
      if (matchNum) {
        const numContentParts = matchNum[2].split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-gray-950 dark:text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return (
              <em key={pIdx} className="italic text-gray-800 dark:text-slate-200">
                {part.slice(1, -1)}
              </em>
            );
          }
          return part;
        });

        return (
          <div key={idx} className="flex items-start gap-2.5 my-1.5 pl-1">
            <span className="font-mono-code font-bold text-blue-600 dark:text-blue-400 text-sm mt-0.5">
              {matchNum[1]}.
            </span>
            <div className="flex-1 leading-relaxed text-sm sm:text-base">{numContentParts}</div>
          </div>
        );
      }

      return (
        <p key={idx} className="my-1.5 leading-relaxed text-sm sm:text-base">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* ─── Page Header (Clean Minimalist Typography - No Icon in Logo) ─── */}
      <div className="w-full bg-white dark:bg-[#0E1626] border border-gray-300 dark:border-slate-800/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-950 dark:text-white tracking-tight">
              Campus Assistant
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              Online 24/7
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 font-normal mt-1.5 max-w-xl">
            Hey <span className="font-semibold text-gray-900 dark:text-white">{studentFirstName}</span>, ask any query to get the direct step-by-step process.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleResetChat}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* ─── Topic Prompt Cards Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TOPIC_CARDS.slice(0, 4).map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(card.query)}
              disabled={isTyping}
              className="text-left bg-white dark:bg-[#0E1626] border border-gray-300 dark:border-slate-800/90 hover:border-[#0B1528] dark:hover:border-blue-500 rounded-2xl p-4 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer group disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-bold text-sm text-gray-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {card.title}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">
                {card.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* ─── Full-Page Conversation Box ─── */}
      <div className="w-full bg-white dark:bg-[#0E1626] border border-gray-300 dark:border-slate-800/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden flex flex-col h-[650px] min-h-[500px]">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {!isUser && (
                  <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1.5 px-1 tracking-wide uppercase">
                    Campus Assistant
                  </span>
                )}

                <div className={`max-w-[88%] sm:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 sm:p-5 rounded-2xl text-sm sm:text-base leading-relaxed ${
                      isUser
                        ? 'bg-[#0B1528] dark:bg-blue-600 text-white rounded-tr-xs shadow-xs font-medium'
                        : 'bg-gray-100/90 dark:bg-[#131D31] text-gray-900 dark:text-slate-100 border border-gray-200/80 dark:border-slate-800/90 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      renderFormattedText(msg.text)
                    )}
                  </div>

                  {/* Actions / Direct Navigation Pills */}
                  {!isUser && msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <span className="text-[10.5px] text-gray-400 dark:text-slate-500 mt-1.5 px-1 font-mono-code">
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex flex-col items-start max-w-[85%]">
              <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1.5 px-1 uppercase tracking-wide">
                Campus Assistant
              </span>
              <div className="p-4 bg-gray-100/90 dark:bg-[#131D31] border border-gray-200/80 dark:border-slate-800/90 rounded-2xl rounded-tl-xs flex items-center gap-2 shadow-2xs">
                <span className="w-2 h-2 bg-[#0B1528] dark:bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-[#0B1528] dark:bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-[#0B1528] dark:bg-blue-400 rounded-full animate-bounce" />
                <span className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 ml-2 font-medium">
                  Writing step-by-step process...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── Bottom Input Bar ─── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-gray-50/90 dark:bg-[#0B111E]/95 border-t border-gray-200 dark:border-slate-800 flex items-center gap-2 sm:gap-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Hey ${studentFirstName}, ask any campus query...`}
            disabled={isTyping}
            className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-[#131D31] border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-2xs"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-5 py-3 rounded-2xl bg-[#0B1528] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md font-bold text-sm flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
