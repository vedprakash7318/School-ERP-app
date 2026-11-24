import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  School,
  GraduationCap,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  ArrowRight,
  ShieldCheck,
  Printer,
  ChevronRight,
} from 'lucide-react';

const PublicAdmission = () => {
  const { slug } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    classId: '',
    gender: 'MALE',
    dob: '',
    bloodGroup: 'B+',
    category: 'GENERAL',
    nationality: 'Indian',
    photo: '',
    parentName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    parentPhone: '',
    secondaryPhone: '',
    email: '',
    address: '',
    previousSchool: '',
    previousBoard: 'CBSE',
    previousMarks: '',
    hasTC: true,
    healthNotes: '',
    documentsChecked: ['Birth Certificate', 'Aadhar Card'],
    declarationAccepted: false,
  });

  const availableDocs = [
    'Birth Certificate',
    'Student Aadhar Card',
    'Parent Aadhar Card',
    'Previous Marksheet',
    'Transfer Certificate (TC)',
    'Address Proof',
  ];

  useEffect(() => {
    fetchSchoolInfo();
  }, [slug]);

  const fetchSchoolInfo = async () => {
    try {
      const res = await axios.get(`/api/public/schools/${slug}`);
      if (res.data.success) {
        setSchool(res.data.data);
        if (res.data.data.classes?.length > 0) {
          setForm((prev) => ({ ...prev, classId: res.data.data.classes[0].id }));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'School not found or portal inactive.');
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
        const res = await axios.post('/api/upload?type=students', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
          setForm((prev) => ({ ...prev, photo: res.data.data.url }));
          return;
        }
      } catch (err) {
        console.error('Upload via endpoint failed, falling back to base64', err);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocToggle = (doc) => {
    setForm((prev) => {
      const exists = prev.documentsChecked.includes(doc);
      return {
        ...prev,
        documentsChecked: exists
          ? prev.documentsChecked.filter((d) => d !== doc)
          : [...prev.documentsChecked, doc],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.declarationAccepted) {
      alert('Please accept the mandatory declaration terms to submit application.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`/api/public/schools/${slug}/admission`, form);
      if (res.data.success) {
        setSubmittedData(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit admission application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-black">School Portal Unavailable</h2>
        <p className="text-slate-400 text-sm mt-2 max-w-md">{error}</p>
      </div>
    );
  }

  // Success Confirmation Screen
  if (submittedData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Admission Form Received
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Application Submitted Successfully!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your application has been logged for {school.name}.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Auto Admission ID:</span>
              <span className="font-mono font-black text-emerald-800 text-sm">
                {submittedData.admissionNo}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Student Name:</span>
              <span className="font-bold text-slate-800">{submittedData.studentName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Class Applied:</span>
              <span className="font-bold text-slate-800">{submittedData.className}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Status:</span>
              <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                Pending Verification
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Please note your Admission ID for future reference. The school office will contact you for document verification.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Acknowledgement</span>
            </button>
            <button
              onClick={() => setSubmittedData(null)}
              className="py-2.5 px-4 border border-slate-300 font-bold text-xs rounded-xl text-slate-700 hover:bg-slate-50"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* School Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 text-white text-center relative">
          <div className="flex items-center justify-center gap-3 mb-2">
            {school.logo ? (
              <img
                src={school.logo}
                alt="logo"
                className="w-12 h-12 rounded-2xl object-cover bg-white p-1 border border-white/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/30 flex items-center justify-center">
                <School className="w-6 h-6 text-emerald-300" />
              </div>
            )}
            <div className="text-left">
              <h1 className="text-xl font-black leading-tight">{school.name}</h1>
              <p className="text-[11px] text-emerald-200 font-mono">
                Code: {school.code} • Prefix: {school.admissionPrefix}
              </p>
            </div>
          </div>
          <span className="inline-block mt-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-emerald-300 border border-white/15">
            Online Student Admission Portal (Session {school.sessions[0]?.name || 'Current'})
          </span>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Student Information */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <GraduationCap className="w-4 h-4" />
              1. Student Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Student first name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Student last name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Class Applying For *</label>
                <select
                  required
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  {school.classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - Section {c.section}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender *</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                <input
                  type="text"
                  value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                  placeholder="e.g. B+, O+, A+"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="GENERAL">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Passport Size Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Parent Information */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <User className="w-4 h-4" />
              2. Parent / Guardian Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Father / Primary Guardian Name *</label>
                <input
                  type="text"
                  required
                  value={form.parentName}
                  onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                  placeholder="Father's full name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Father's Occupation</label>
                <input
                  type="text"
                  value={form.fatherOccupation}
                  onChange={(e) => setForm({ ...form, fatherOccupation: e.target.value })}
                  placeholder="e.g. Engineer, Business"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mother's Name</label>
                <input
                  type="text"
                  value={form.motherName}
                  onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                  placeholder="Mother's full name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mother's Occupation</label>
                <input
                  type="text"
                  value={form.motherOccupation}
                  onChange={(e) => setForm({ ...form, motherOccupation: e.target.value })}
                  placeholder="e.g. Teacher, Homemaker"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Mobile Phone *</label>
                <input
                  type="text"
                  required
                  value={form.parentPhone}
                  onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="parent@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Residential Address *</label>
                <textarea
                  rows={2}
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="House number, street, city, pin code"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Previous Academic Records */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <FileText className="w-4 h-4" />
              3. Previous School & Health
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Previous School Attended</label>
                <input
                  type="text"
                  value={form.previousSchool}
                  onChange={(e) => setForm({ ...form, previousSchool: e.target.value })}
                  placeholder="School name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Previous Marks / Grade</label>
                <input
                  type="text"
                  value={form.previousMarks}
                  onChange={(e) => setForm({ ...form, previousMarks: e.target.value })}
                  placeholder="e.g. 88.5% or A Grade"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Health & Allergies Info (Optional)</label>
                <input
                  type="text"
                  value={form.healthNotes}
                  onChange={(e) => setForm({ ...form, healthNotes: e.target.value })}
                  placeholder="Any medical condition or dietary allergy"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Documents Checklist */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 mb-2">
              4. Documents Available for Verification
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {availableDocs.map((doc) => (
                <label
                  key={doc}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form.documentsChecked.includes(doc)}
                    onChange={() => handleDocToggle(doc)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-slate-700 font-medium text-[11px]">{doc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Declaration Acceptance */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={form.declarationAccepted}
                onChange={(e) => setForm({ ...form, declarationAccepted: e.target.checked })}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 flex-shrink-0"
              />
              <span className="text-xs text-slate-700 leading-snug">
                I hereby declare that all information provided above is true and accurate to the best of my knowledge. I agree to comply with the school rules and regulations upon admission.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <span>{submitting ? 'Submitting Application...' : 'Submit Online Admission Form'}</span>
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicAdmission;
