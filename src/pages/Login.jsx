import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { School, Mail, Lock, ArrowRight, AlertCircle, Smartphone } from 'lucide-react';

const Login = () => {
  const { slug } = useParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [schoolInfo, setSchoolInfo] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      axios
        .get(`/api/public/schools/${slug}`)
        .then((res) => {
          if (res.data.success) {
            setSchoolInfo(res.data.data);
          }
        })
        .catch((e) => console.error(e));
    }
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerDemoFill = () => {
    setEmail('owner@dps.com');
    setPassword('school123');
  };

  const handlePrincipalDemoFill = () => {
    setEmail('principal@dps.com');
    setPassword('school123');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-5 relative overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Device status info */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-1">
        <span className="flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          School Admin Mobile App
        </span>
        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
          EduCloud v2.0
        </span>
      </div>

      {/* Brand Header */}
      <div className="text-center my-auto py-6">
        <div className="mx-auto mb-3 flex justify-center">
          {schoolInfo?.logo ? (
            <img
              src={schoolInfo.logo}
              alt="logo"
              className="w-16 h-16 rounded-3xl object-cover bg-white p-1 border-2 border-emerald-400 shadow-xl"
            />
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
              <School className="w-9 h-9" />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">
          {schoolInfo?.name || 'School Principal Portal'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          {schoolInfo
            ? `Sign in to access ${schoolInfo.name} administration console.`
            : 'Manage classes, faculty, student enrollment, and fees on the go.'}
        </p>

        {/* Card Form */}
        <div className="mt-6 bg-slate-800/80 backdrop-blur-md p-5 rounded-3xl border border-slate-700/80 shadow-2xl text-left">
          {error && (
            <div className="mb-4 bg-rose-500/15 border border-rose-500/30 p-3 rounded-2xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Principal / Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="schooladmin@dps.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-2xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-2xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
            >
              <span>{loading ? 'Logging in...' : 'Sign In to School'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Fill Demo buttons */}
          <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2">
            <div className="text-[10px] text-slate-400 text-center font-semibold uppercase tracking-wider">
              Quick Demo Fill
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOwnerDemoFill}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-amber-500/30 rounded-xl text-[10px] text-amber-300 font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <span>👑 School Owner</span>
              </button>
              <button
                type="button"
                onClick={handlePrincipalDemoFill}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-indigo-500/30 rounded-xl text-[10px] text-indigo-300 font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <span>🎓 Principal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-500 pb-1">
        EduCloud SaaS • Mobile & Tablet App Edition
      </div>
    </div>
  );
};

export default Login;
