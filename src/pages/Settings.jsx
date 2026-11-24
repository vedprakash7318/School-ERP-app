import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  School,
  Upload,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Tag,
  Users,
  UserPlus,
  Plus,
} from 'lucide-react';

const Settings = () => {
  const [school, setSchool] = useState(null);
  const [schoolUsers, setSchoolUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form: School Profile & Branding
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    admissionPrefix: 'DPS',
    logo: '',
  });

  // Form: Change Password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Form: Add School User (Principal / Staff)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'PRINCIPAL',
    password: '',
  });
  const [userMsg, setUserMsg] = useState({ error: '', success: '' });

  const [schoolMsg, setSchoolMsg] = useState({ error: '', success: '' });
  const [pwdMsg, setPwdMsg] = useState({ error: '', success: '' });

  useEffect(() => {
    fetchSettings();
    fetchUsers();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/school-admin/settings');
      if (res.data.success) {
        setSchool(res.data.data);
        setSchoolForm({
          name: res.data.data.name || '',
          email: res.data.data.email || '',
          phone: res.data.data.phone || '',
          address: res.data.data.address || '',
          city: res.data.data.city || '',
          state: res.data.data.state || '',
          admissionPrefix: res.data.data.admissionPrefix || 'DPS',
          logo: res.data.data.logo || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/school-admin/settings/users');
      if (res.data.success) {
        setSchoolUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load school users', err);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/upload?type=logos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
          setSchoolForm((prev) => ({ ...prev, logo: res.data.data.url }));
          return;
        }
      } catch (err) {
        console.error('Logo upload endpoint failed, falling back to base64', err);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolForm((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSchool = async (e) => {
    e.preventDefault();
    setSchoolMsg({ error: '', success: '' });

    try {
      const res = await api.put('/school-admin/settings', schoolForm);
      if (res.data.success) {
        setSchool(res.data.data);
        setSchoolMsg({ success: 'School branding details saved successfully!', error: '' });
      }
    } catch (err) {
      setSchoolMsg({ error: err.response?.data?.message || 'Failed to update settings', success: '' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ error: '', success: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwdMsg({ error: 'New password and confirm password do not match', success: '' });
      return;
    }

    try {
      const res = await api.put('/school-admin/settings/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.data.success) {
        setPwdMsg({ success: res.data.message, error: '' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPwdMsg({ error: err.response?.data?.message || 'Failed to change password', success: '' });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserMsg({ error: '', success: '' });

    try {
      const res = await api.post('/school-admin/settings/users', newUserForm);
      if (res.data.success) {
        setUserMsg({ success: res.data.message, error: '' });
        setNewUserForm({ name: '', email: '', phone: '', role: 'PRINCIPAL', password: '' });
        setIsAddUserOpen(false);
        fetchUsers();
      }
    } catch (err) {
      setUserMsg({ error: err.response?.data?.message || 'Failed to create user', success: '' });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 font-semibold">
        Loading School Settings...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div>
        <h2 className="text-base font-extrabold text-slate-900">School Settings & Management</h2>
        <p className="text-[11px] text-slate-500">Configure logo, custom prefixes, leadership & security</p>
      </div>

      {/* 1. School Leadership & User Logins (Owner vs Principal) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                School Leadership & Accounts
              </h3>
              <p className="text-[10px] text-slate-400">Owner (Chairman) vs Principal accounts</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddUserOpen(!isAddUserOpen)}
            className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200/80 flex items-center gap-1 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Appoint Principal</span>
          </button>
        </div>

        {userMsg.success && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
            {userMsg.success}
          </div>
        )}
        {userMsg.error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {userMsg.error}
          </div>
        )}

        {/* Add User Form Drawer */}
        {isAddUserOpen && (
          <form onSubmit={handleCreateUser} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs animate-in fade-in">
            <div className="font-extrabold text-slate-800 text-[11px] flex items-center justify-between">
              <span>Appoint Principal or Academic Staff</span>
              <button type="button" onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Role *</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="PRINCIPAL">🎓 Principal (Academic Head)</option>
                  <option value="STAFF">👨‍🏫 Staff / Teacher</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="principal@dps.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="Phone Number"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Initial Password (Default = Phone)</label>
              <input
                type="text"
                placeholder="Optional custom password"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-xs"
            >
              Confirm & Create Login Account
            </button>
          </form>
        )}

        {/* Existing Users List */}
        <div className="space-y-2">
          {schoolUsers.map((u) => (
            <div
              key={u.id}
              className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                      u.role === 'SCHOOL_ADMIN'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : u.role === 'PRINCIPAL'
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {u.role === 'SCHOOL_ADMIN' ? '👑 OWNER / MANAGEMENT' : u.role === 'PRINCIPAL' ? '🎓 PRINCIPAL' : 'STAFF'}
                  </span>
                  <span className="font-bold text-xs text-slate-800">{u.name}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {u.email} {u.phone ? `• ${u.phone}` : ''}
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                {u.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. School Profile & Branding */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <School className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            School Information & Branding
          </h3>
        </div>

        {schoolMsg.error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {schoolMsg.error}
          </div>
        )}
        {schoolMsg.success && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
            {schoolMsg.success}
          </div>
        )}

        <form onSubmit={handleSaveSchool} className="space-y-3 text-xs">
          {/* Logo Preview & Upload */}
          <div className="flex items-center gap-3">
            {schoolForm.logo ? (
              <img
                src={schoolForm.logo}
                alt="Logo"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                No Logo
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Upload School Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">School Name *</label>
            <input
              type="text"
              required
              value={schoolForm.name}
              onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Custom Admission Prefix</label>
              <input
                type="text"
                required
                value={schoolForm.admissionPrefix}
                onChange={(e) => setSchoolForm({ ...schoolForm, admissionPrefix: e.target.value.toUpperCase() })}
                placeholder="e.g. DPS, WOOD, STU"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-emerald-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                required
                value={schoolForm.phone}
                onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Official Email</label>
            <input
              type="email"
              required
              value={schoolForm.email}
              onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Address</label>
            <input
              type="text"
              value={schoolForm.address}
              onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={schoolForm.city}
                onChange={(e) => setSchoolForm({ ...schoolForm, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={schoolForm.state}
                onChange={(e) => setSchoolForm({ ...schoolForm, state: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save School Details</span>
          </button>
        </form>
      </div>

      {/* 3. Change Account Password */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Lock className="w-4 h-4 text-slate-600" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Security & Password
          </h3>
        </div>

        {pwdMsg.error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium mb-3">
            {pwdMsg.error}
          </div>
        )}
        {pwdMsg.success && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium mb-3">
            {pwdMsg.success}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password *</label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
