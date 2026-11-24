import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  GraduationCap,
  ArrowLeft,
  Printer,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  BookOpen,
  User,
  ShieldCheck,
  CheckCircle2,
  Heart,
  FileText,
} from 'lucide-react';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, fees, academics, idcard

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/school-admin/students/${id}/profile`);
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  const { student, academics, fees, idCard } = profile;

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/students')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Profile</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
        {student.photo ? (
          <img
            src={student.photo}
            alt="Student"
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-emerald-600/30">
            {student.firstName.charAt(0)}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              {student.firstName} {student.lastName}
            </h2>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                student.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {student.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              {student.classRoom?.name} - {student.classRoom?.section}
            </span>
            <span>•</span>
            <span className="font-mono font-bold text-emerald-700">Roll: {student.rollNo}</span>
            <span>•</span>
            <span className="font-mono text-slate-400">Adm: {student.admissionNo}</span>
          </div>
        </div>
      </div>

      {/* 4 Segmented Tabs */}
      <div className="grid grid-cols-4 bg-slate-200/80 p-1 rounded-2xl text-[11px] font-black text-center">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-1.5 rounded-xl transition-all ${
            activeTab === 'overview' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`py-1.5 rounded-xl transition-all ${
            activeTab === 'fees' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Fees Ledger
        </button>
        <button
          onClick={() => setActiveTab('academics')}
          className={`py-1.5 rounded-xl transition-all ${
            activeTab === 'academics' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Academics
        </button>
        <button
          onClick={() => setActiveTab('idcard')}
          className={`py-1.5 rounded-xl transition-all ${
            activeTab === 'idcard' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          ID Card
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 text-xs">
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
              Personal & Demographic
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Gender:</span>
                <span className="font-bold text-slate-800">{student.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Date of Birth:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Blood Group:</span>
                <span className="font-bold text-rose-600">{student.bloodGroup || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Category:</span>
                <span className="font-semibold text-slate-800">{student.category || 'General'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 text-xs">
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
              Parents & Residential Info
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Father's Name:</span>
                <span className="font-bold text-slate-800">{student.parentName}</span>
                {student.fatherOccupation && (
                  <span className="text-[10px] text-slate-400 block">({student.fatherOccupation})</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Mother's Name:</span>
                <span className="font-bold text-slate-800">{student.motherName || 'N/A'}</span>
                {student.motherOccupation && (
                  <span className="text-[10px] text-slate-400 block">({student.motherOccupation})</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Primary Mobile:</span>
                <a href={`tel:${student.parentPhone}`} className="font-mono font-bold text-emerald-700 hover:underline">
                  {student.parentPhone}
                </a>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Secondary Contact:</span>
                <span className="font-mono text-slate-600">{student.secondaryPhone || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px]">Residential Address:</span>
                <span className="font-medium text-slate-800">{student.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          {student.previousSchool && (
            <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-2 text-xs">
              <h3 className="font-black text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1.5">
                Previous Academic Record
              </h3>
              <p className="text-slate-700">
                School: <strong className="text-slate-900">{student.previousSchool}</strong> ({student.previousBoard}) • Score: <strong className="text-emerald-700">{student.previousMarks}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FEES LEDGER */}
      {activeTab === 'fees' && (
        <div className="space-y-3">
          {/* Summary Strip */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-4 shadow-sm space-y-2">
            <span className="text-[10px] uppercase font-bold text-emerald-300">Annual Fee Summary</span>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white/10 rounded-2xl p-2">
                <span className="text-[10px] text-slate-300 block">Total Due</span>
                <span className="text-sm font-black">₹{fees.totalAnnualFee}</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-2">
                <span className="text-[10px] text-slate-300 block">Total Paid</span>
                <span className="text-sm font-black text-emerald-300">₹{fees.totalPaid}</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-2">
                <span className="text-[10px] text-slate-300 block">Balance Pending</span>
                <span className={`text-sm font-black ${fees.pendingDue > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                  ₹{fees.pendingDue}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Receipts History */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-2.5">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">
              Fee Receipts ({fees.payments?.length || 0})
            </h3>

            {fees.payments?.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">No fee receipts issued yet.</p>
            ) : (
              fees.payments.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900">{p.receiptNo}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {new Date(p.paymentDate).toLocaleDateString()} • {p.paymentMode}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-800 text-sm block">₹{p.amountPaid}</span>
                    <button
                      onClick={() => window.print()}
                      className="text-[10px] text-emerald-700 font-bold hover:underline"
                    >
                      Print Slip
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ACADEMICS */}
      {activeTab === 'academics' && (
        <div className="space-y-3">
          <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-2 text-xs">
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
              Class Teacher Allocation
            </h3>
            {academics.classTeacher ? (
              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-black text-sm flex items-center justify-center border border-amber-200">
                  {academics.classTeacher.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{academics.classTeacher.name}</h4>
                  <p className="text-[11px] text-slate-500">{academics.classTeacher.designation}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{academics.classTeacher.phone}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-xs">No class teacher allocated yet.</p>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-2.5 text-xs">
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
              Subjects & Faculty Taught
            </h3>
            {academics.subjects?.length === 0 ? (
              <p className="text-slate-400 text-xs">No subjects mapped to this class.</p>
            ) : (
              academics.subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center"
                >
                  <div>
                    <h5 className="font-bold text-slate-900">{sub.subject?.name}</h5>
                    <span className="text-[10px] text-slate-500">Teacher: {sub.staff?.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {sub.periodsPerWeek} Periods/wk
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DIGITAL ID CARD & PRINT */}
      {activeTab === 'idcard' && (
        <div className="space-y-4">
          <div
            id="student-id-card"
            className="w-full max-w-sm mx-auto bg-white rounded-3xl border-2 border-emerald-600 shadow-xl overflow-hidden text-center relative"
          >
            {/* ID Card Top Header */}
            <div className="bg-emerald-800 text-white p-3 space-y-0.5">
              <h3 className="font-black text-xs uppercase tracking-tight">{idCard.schoolName}</h3>
              <p className="text-[9px] text-emerald-200">{idCard.schoolAddress}</p>
            </div>

            <div className="p-4 space-y-3">
              {idCard.photo ? (
                <img
                  src={idCard.photo}
                  alt="Student"
                  className="w-20 h-20 rounded-2xl mx-auto object-cover border-2 border-emerald-600"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-2xl flex items-center justify-center mx-auto border-2 border-emerald-600">
                  {idCard.studentName.charAt(0)}
                </div>
              )}

              <div>
                <h4 className="text-sm font-black text-slate-900">{idCard.studentName}</h4>
                <p className="text-[11px] font-extrabold text-emerald-700">{idCard.className}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 text-[10px] space-y-1 text-left font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Roll No:</span>
                  <span className="font-bold text-slate-800">{idCard.rollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Admission No:</span>
                  <span className="font-bold text-slate-800">{idCard.admissionNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span className="font-bold text-slate-800">{idCard.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency Phone:</span>
                  <span className="font-bold text-slate-800">{idCard.parentPhone}</span>
                </div>
              </div>

              <div className="pt-2 text-[9px] text-slate-400 font-bold border-t border-slate-100">
                OFFICIAL STUDENT IDENTITY CARD
              </div>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full max-w-sm mx-auto py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Student ID Card</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
