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
      <div className="w-full max-w-md bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-xl relative overflow-hidden text-gray-900">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E8F8F0] border border-[#05A86B]/30 text-[#05A86B] mb-4 shadow-sm">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in with your verified college credentials</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-600 text-sm font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Credentials Box */}
        <div className="mb-6 p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="text-xs text-gray-500 font-medium mb-2.5 flex items-center justify-between">
            <span className="font-bold text-gray-700">Quick Demo Accounts:</span>
            <span className="text-[10px] bg-white text-gray-700 font-bold px-2 py-0.5 rounded-md border border-gray-200">1-Click Fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ email: 'student@campusbond.edu', password: 'password123' })}
              className="p-2.5 text-left bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#05A86B] rounded-xl transition-all cursor-pointer group shadow-2xs"
            >
              <div className="text-xs font-bold text-gray-900 group-hover:text-[#05A86B] transition-colors">Aarav (Student)</div>
              <div className="text-[11px] text-gray-500 truncate">student@campusbond.edu</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'test@campusbond.edu', password: 'password123' })}
              className="p-2.5 text-left bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#05A86B] rounded-xl transition-all cursor-pointer group shadow-2xs"
            >
              <div className="text-xs font-bold text-gray-900 group-hover:text-[#05A86B] transition-colors">Vikash (Test)</div>
              <div className="text-[11px] text-gray-500 truncate">test@campusbond.edu</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              College Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@campusbond.edu"
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#05A86B] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#05A86B] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-[#05A86B] hover:bg-[#048E5A] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#05A86B]/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
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

        <div className="mt-8 text-center text-xs text-gray-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-[#05A86B] hover:underline">
            Register with college ID
          </Link>
        </div>
      </div>
    </div>
  );
}
