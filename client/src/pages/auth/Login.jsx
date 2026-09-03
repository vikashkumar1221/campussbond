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
      <div className="w-full max-w-md bg-[#1A1D21] border border-[#282D33] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 bg-[#E58A3C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#23272D] border border-[#343A42] text-[#E58A3C] mb-4 shadow-lg">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-sm text-[#8A94A0] mt-1">Sign in with your verified college credentials</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#2B1818] border border-[#FF6B6B]/30 flex items-center gap-3 text-[#FF6B6B] text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase tracking-wider mb-2">
              College Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A94A0]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@campusbond.edu"
                className="w-full pl-10 pr-4 py-3 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/60 focus:outline-none focus:border-[#E58A3C] focus:ring-1 focus:ring-[#E58A3C] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A94A0]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/60 focus:outline-none focus:border-[#E58A3C] focus:ring-1 focus:ring-[#E58A3C] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-[#E58A3C] hover:bg-[#D97724] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#E58A3C]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

        <div className="mt-8 text-center text-xs text-[#8A94A0]">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-[#E58A3C] hover:underline">
            Register with college ID
          </Link>
        </div>
      </div>
    </div>
  );
}
