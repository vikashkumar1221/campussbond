import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, GraduationCap } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121417] border border-[#1E2228] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#181B20] border border-[#242932] text-white mb-4 shadow-sm">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-sm text-[#7C8592] mt-1">Sign in with your verified college credentials</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#251515] border border-[#FF6B6B]/30 flex items-center gap-3 text-[#FF6B6B] text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Credentials Box */}
        <div className="mb-6 p-3.5 rounded-2xl bg-[#0F1114] border border-[#1E2228]">
          <div className="text-xs text-[#7C8592] font-medium mb-2.5 flex items-center justify-between">
            <span className="font-semibold text-gray-300">Quick Demo Accounts:</span>
            <span className="text-[10px] bg-[#181B20] text-[#A6B0BC] font-semibold px-2 py-0.5 rounded-md border border-[#242932]">1-Click Fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ email: 'student@campusbond.edu', password: 'password123' })}
              className="p-2.5 text-left bg-[#121417] hover:bg-[#181B20] border border-[#1E2228] hover:border-[#2D333E] rounded-xl transition-all cursor-pointer group"
            >
              <div className="text-xs font-bold text-white group-hover:text-gray-200 transition-colors">Aarav (Student)</div>
              <div className="text-[11px] text-[#7C8592] truncate">student@campusbond.edu</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'test@campusbond.edu', password: 'password123' })}
              className="p-2.5 text-left bg-[#121417] hover:bg-[#181B20] border border-[#1E2228] hover:border-[#2D333E] rounded-xl transition-all cursor-pointer group"
            >
              <div className="text-xs font-bold text-white group-hover:text-gray-200 transition-colors">Vikash (Test)</div>
              <div className="text-[11px] text-[#7C8592] truncate">test@campusbond.edu</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase tracking-wider mb-2">
              College Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7C8592]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@campusbond.edu"
                className="w-full pl-10 pr-4 py-3 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#7C8592]/50 focus:outline-none focus:border-[#3D4554] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7C8592]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#7C8592]/50 focus:outline-none focus:border-[#3D4554] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-[#20242B] hover:bg-[#282D36] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 border border-[#2D333E] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#7C8592]">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-white hover:underline">
            Register with college ID
          </Link>
        </div>
      </div>
    </div>
  );
}
