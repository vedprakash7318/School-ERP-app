import React from 'react';
import { useAuth } from '../context/AuthContext';
import { School, ShieldCheck, AlertCircle } from 'lucide-react';

const AppHeader = ({ title, showSchoolName = true }) => {
  const { user } = useAuth();
  const school = user?.school;
  const isExpired = !user?.isSubscriptionActive;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
          <School className="w-5 h-5" />
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-extrabold text-slate-900 line-clamp-1">
            {title || school?.name || 'School ERP'}
          </h1>
          {showSchoolName && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-bold text-emerald-600">
                {school?.code || 'DPS'}
              </span>
              <span className="text-[10px] text-slate-400">•</span>
              <span className="text-[10px] text-slate-500">{school?.city || 'Admin App'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <span
          className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
            user?.role === 'SCHOOL_ADMIN'
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : user?.role === 'PRINCIPAL'
              ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
              : 'text-slate-600 bg-slate-100 border-slate-200'
          }`}
        >
          {user?.role === 'SCHOOL_ADMIN' ? '👑 OWNER' : user?.role === 'PRINCIPAL' ? '🎓 PRINCIPAL' : 'STAFF'}
        </span>

        {isExpired ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" />
            Expired
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            Active
          </span>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
