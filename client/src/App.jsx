import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

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

// Protected Route wrapper: requires authenticated user
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1012]">
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
      <div className="min-h-screen flex items-center justify-center bg-[#0F1012]">
        <LoadingSpinner message="Restoring session..." />
      </div>
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#0F1012] text-[#E6E9EC]">
          <Navbar />
          <main className="flex-1 pb-20 md:pb-8">
            <Routes>
              {/* Public/Guest Routes */}
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

              {/* Protected Routes */}
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
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
