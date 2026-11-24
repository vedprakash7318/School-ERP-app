import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users2,
  Layers,
  BookOpen,
  Calendar,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  CreditCard,
  UserPlus,
  ArrowRight,
  Clock,
  Settings,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/school-admin/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = !user?.isSubscriptionActive;
  const sub = data?.subscription;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Greeting Banner with School Branding */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
              {user?.role === 'PRINCIPAL' ? 'Principal Workspace' : 'School Admin Workspace'}
            </span>
            <Link
              to="/sessions"
              className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded-full border border-white/20 transition-colors"
            >
              <Calendar className="w-3 h-3 text-emerald-300" />
              <span>Session: {data?.activeSession?.name || 'Set Session'}</span>
            </Link>
          </div>

          <h2 className="text-lg font-black mt-2 leading-tight">{user?.name}</h2>
          <p className="text-xs text-emerald-100/90 mt-0.5 font-medium">
            {user?.school?.name} (Prefix: <span className="font-mono font-bold text-emerald-300">{user?.school?.code}</span>)
          </p>

          {/* Subscription Validity Chip */}
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl border border-white/15">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {sub?.plan ? `${sub.plan.name} (${sub.plan.billingCycle})` : 'Active License'}:{' '}
              {sub ? `Valid till ${new Date(sub.endDate).toLocaleDateString()}` : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Expired Warning */}
      {isExpired && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block">Subscription Expired!</span>
            <span className="text-[11px] text-rose-700">
              Your school subscription term has ended. Please contact the Super Admin to renew your license.
            </span>
          </div>
        </div>
      )}

      {/* Pending Applications Alerts */}
      {(data?.pendingAdmissions > 0 || data?.pendingStaff > 0) && (
        <div className="space-y-2">
          {data?.pendingAdmissions > 0 && (
            <Link
              to="/students"
              className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-900 text-xs active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black block">
                    {data.pendingAdmissions} Pending Online Admission Applications
                  </span>
                  <span className="text-[10px] text-amber-700">Received from public admission link</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600" />
            </Link>
          )}

          {data?.pendingStaff > 0 && (
            <Link
              to="/staff"
              className="p-3 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between text-orange-900 text-xs active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black block">
                    {data.pendingStaff} Staff Onboarding Applications
                  </span>
                  <span className="text-[10px] text-orange-700">Awaiting your approval</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-orange-600" />
            </Link>
          )}
        </div>
      )}

      {/* Today's Fee Collection Highlight Card */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Today's Fee Collection
            </span>
            <div className="text-xl font-black text-slate-900">
              ₹{data?.todayFeeCollection || 0}
            </div>
            <span className="text-[10px] font-semibold text-emerald-700">
              {data?.todayTransactionsCount || 0} Receipts Issued Today
            </span>
          </div>
        </div>
        <Link
          to="/fees"
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
        >
          Collect Fee
        </Link>
      </div>

      {/* Quick Action Shortcuts (6 Grid) */}
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
          Management Modules
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          <Link
            to="/students"
            className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Students</span>
          </Link>

          <Link
            to="/fees"
            className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-1">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Fees</span>
          </Link>

          <Link
            to="/classes"
            className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-1">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Classes</span>
          </Link>

          <Link
            to="/subjects"
            className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-1">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Subjects</span>
          </Link>

          <Link
            to="/staff"
            className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-1">
              <Users2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Staff & HR</span>
          </Link>

          <Link
            to="/sessions"
            className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-1">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Sessions</span>
          </Link>
        </div>
      </div>

      {/* KPI Tiles 2x2 */}
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
          Institution Live Counts
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Active Students</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <GraduationCap className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {data?.totalStudents || 0}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Teachers</span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Users2 className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {data?.totalStaff || 0}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Classes</span>
              <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Layers className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {data?.totalClasses || 0}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Subjects</span>
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {data?.totalSubjects || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Admissions List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-900">Recent Student Admissions</h3>
          <Link to="/students" className="text-[11px] font-bold text-emerald-700 hover:underline">
            View All &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {data?.recentStudents?.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No students registered yet.</p>
          ) : (
            data?.recentStudents?.map((s) => (
              <Link
                key={s.id}
                to={`/students/${s.id}`}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 rounded-xl px-1"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    {s.firstName?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {s.firstName} {s.lastName}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Adm #{s.admissionNo} • Roll #{s.rollNo}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {s.classRoom ? `${s.classRoom.name}-${s.classRoom.section}` : '-'}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
