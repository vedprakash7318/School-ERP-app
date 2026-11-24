import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Briefcase,
  School,
  User,
  Phone,
  Mail,
  CreditCard,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const PublicJoinStaff = () => {
  const { slug } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'MALE',
    dob: '',
    maritalStatus: 'SINGLE',
    fatherHusbandName: '',
    address: '',
    aadharNo: '',
    panNo: '',
    bankName: '',
    accountNo: '',
    ifscCode: '',
    pfUan: '',
    highestQualification: '',
    subjectsTaught: '',
    experienceYears: '3 Years',
    employmentType: 'FULL_TIME',
    expectedSalary: '',
    photo: '',
  });

  useEffect(() => {
    fetchSchool();
  }, [slug]);

  const fetchSchool = async () => {
    try {
      const res = await axios.get(`/api/public/schools/${slug}`);
      if (res.data.success) {
        setSchool(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'School portal inactive.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post('/api/upload?type=staff', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
          setForm((prev) => ({ ...prev, photo: res.data.data.url }));
          return;
        }
      } catch (err) {
        console.error('Staff upload failed, falling back to base64', err);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/public/schools/${slug}/join-staff`, form);
      if (res.data.success) {
        setSubmittedData(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit staff application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-black">Portal Unavailable</h2>
        <p className="text-slate-400 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (submittedData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Application Logged
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Onboarding Application Received!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Thank you {submittedData.name}. Your details have been submitted to {school.name}.
            </p>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            The school principal and HR administration will review your qualifications and contact you. Once approved, your employee code and staff login access will be activated.
          </p>

          <button
            onClick={() => setSubmittedData(null)}
            className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-slate-900 p-6 text-white text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {school.logo ? (
              <img
                src={school.logo}
                alt="logo"
                className="w-12 h-12 rounded-2xl object-cover bg-white p-1"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-amber-200" />
              </div>
            )}
            <div className="text-left">
              <h1 className="text-xl font-black">{school.name}</h1>
              <p className="text-[11px] text-amber-200">Faculty & Staff Self-Onboarding Portal</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Personal Details */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <User className="w-4 h-4" />
              1. Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="teacher@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Marital Status</label>
                <select
                  value={form.maritalStatus}
                  onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Full home address"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Identity & Bank Information */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <CreditCard className="w-4 h-4" />
              2. Identity & Bank Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Aadhar Number</label>
                <input
                  type="text"
                  value={form.aadharNo}
                  onChange={(e) => setForm({ ...form, aadharNo: e.target.value })}
                  placeholder="12 digit aadhar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">PAN Card Number</label>
                <input
                  type="text"
                  value={form.panNo}
                  onChange={(e) => setForm({ ...form, panNo: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  placeholder="e.g. State Bank of India"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={form.accountNo}
                  onChange={(e) => setForm({ ...form, accountNo: e.target.value })}
                  placeholder="Bank account number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={form.ifscCode}
                  onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. SBIN0001234"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">PF UAN Number (Optional)</label>
                <input
                  type="text"
                  value={form.pfUan}
                  onChange={(e) => setForm({ ...form, pfUan: e.target.value })}
                  placeholder="Universal Account Number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Professional & Academic Qualifications */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <GraduationCap className="w-4 h-4" />
              3. Qualifications & Experience
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Highest Qualification *</label>
                <input
                  type="text"
                  required
                  value={form.highestQualification}
                  onChange={(e) => setForm({ ...form, highestQualification: e.target.value })}
                  placeholder="e.g. M.Sc Mathematics, B.Ed"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subjects Taught *</label>
                <input
                  type="text"
                  required
                  value={form.subjectsTaught}
                  onChange={(e) => setForm({ ...form, subjectsTaught: e.target.value })}
                  placeholder="e.g. Mathematics, Science"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Teaching Experience</label>
                <input
                  type="text"
                  value={form.experienceYears}
                  onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                  placeholder="e.g. 5 Years"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expected Monthly Salary (₹)</label>
                <input
                  type="number"
                  value={form.expectedSalary}
                  onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })}
                  placeholder="e.g. 45000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Profile Photo Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-amber-50 file:text-amber-700 font-bold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <span>{submitting ? 'Submitting Application...' : 'Submit Staff Onboarding Form'}</span>
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicJoinStaff;
