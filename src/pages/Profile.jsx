import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  School,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  ShieldCheck,
  LogOut,
  User,
  Shield,
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const school = user?.school;
  const sub = user?.subscription;

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* User / Principal Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-emerald-600/30">
          {user?.name?.charAt(0) || 'P'}
        </div>
        <div>
          <span
            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
              user?.role === 'SCHOOL_ADMIN'
                ? 'text-amber-800 bg-amber-50 border-amber-300'
                : user?.role === 'PRINCIPAL'
                ? 'text-indigo-800 bg-indigo-50 border-indigo-300'
                : 'text-slate-700 bg-slate-50 border-slate-200'
            }`}
          >
            {user?.role === 'SCHOOL_ADMIN'
              ? '👑 School Owner / Management'
              : user?.role === 'PRINCIPAL'
              ? '🎓 Principal & Academic Head'
              : user?.role}
          </span>
          <h2 className="text-base font-extrabold text-slate-900 mt-1 leading-tight">
            {user?.name}
          </h2>
          <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
        </div>
      </div>

      {/* School Institution Details */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <School className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            School Information
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Institutional Name</span>
            <span className="font-bold text-slate-800">{school?.name || 'N/A'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">School Code</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {school?.code || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Status</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                {school?.status || 'ACTIVE'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Official Email</span>
            <span className="text-slate-800 font-medium">{school?.email || 'N/A'}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Contact Phone</span>
            <span className="text-slate-800 font-mono font-semibold">{school?.phone || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Subscription Tier Details */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl text-white p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Subscription Status
            </h3>
          </div>
          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
            {sub?.status || 'ACTIVE'}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">Plan Tier:</span>
            <span className="font-extrabold text-emerald-300 text-sm">
              {sub?.plan?.name || 'Academic License'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">Billing Cycle:</span>
            <span className="font-mono font-bold text-slate-200">
              {sub?.plan?.billingCycle || 'ANNUAL'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">Expiration Date:</span>
            <span className="font-mono font-bold text-slate-200">
              {sub ? new Date(sub.endDate).toLocaleDateString() : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <button
        onClick={logout}
        className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-2xl border border-rose-200 flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of School Account</span>
      </button>
    </div>
  );
};

export default Profile;
