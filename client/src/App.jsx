import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import CampusChatbot from './components/CampusChatbot';
import LoadingSpinner from './components/LoadingSpinner';
import { Menu } from 'lucide-react';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import FeedPage from './pages/feed/FeedPage';
import EventDetailPage from './pages/feed/EventDetailPage';
import LostFoundPage from './pages/lostfound/LostFoundPage';
import MarketPage from './pages/market/MarketPage';
import ClubsPage from './pages/clubs/ClubsPage';
import ChatPage from './pages/chat/ChatPage';
import ProfilePage from './pages/profile/ProfilePage';
import CampusAssistantPage from './pages/assistant/CampusAssistantPage';

// Protected Route wrapper: requires authenticated user
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
        <LoadingSpinner message="Authenticating session..." />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Guest Route wrapper: redirects to / if already logged in
function GuestRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
        <LoadingSpinner message="Restoring session..." />
      </div>
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-[#F6F8FA]">
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F6F8FA] dark:bg-[#070B14] text-[#0A0B0D] dark:text-[#F1F5F9] transition-colors duration-200">
      {/* ─── Persistent Desktop Left Sidebar + Mobile Drawer ─── */}
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* ─── Mobile Header (only on screens < md) ─── */}
        <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-[#0B111E]/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-2xs transition-colors">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="font-display font-black text-lg text-gray-950 dark:text-white">
            Campus Bond
          </Link>
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 flex items-center justify-center text-gray-950 dark:text-white font-bold text-xs shadow-2xs"
          >
            {user?.name?.charAt(0) || 'U'}
          </Link>
        </header>

        {/* ─── Main Content Canvas ─── */}
        <main className="flex-1 pb-16 md:pb-8">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <FeedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <EventDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lostfound"
              element={
                <ProtectedRoute>
                  <LostFoundPage />
                </ProtectedRoute>
              }
            />
            <Route path="/lost-found" element={<Navigate to="/lostfound" replace />} />
            <Route
              path="/market"
              element={
                <ProtectedRoute>
                  <MarketPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clubs"
              element={
                <ProtectedRoute>
                  <ClubsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route path="/messages" element={<Navigate to="/chat" replace />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assistant"
              element={
                <ProtectedRoute>
                  <CampusAssistantPage />
                </ProtectedRoute>
              }
            />
            <Route path="/campus-assistant" element={<Navigate to="/assistant" replace />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* ─── Global AI Campus Chatbot Assistant ─── */}
      <CampusChatbot />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
