import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import {
  Users2,
  Plus,
  Search,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

const Staff = () => {
  const [activeTab, setActiveTab] = useState('approved'); // 'approved' or 'applications'

  const [staff, setStaff] = useState([]);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Direct Staff Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Approve Application Modal
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [appToApprove, setAppToApprove] = useState(null);
  const [approveForm, setApproveForm] = useState({
    designation: 'Senior Teacher',
    salary: '45000',
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    qualification: '',
    salary: '',
    status: 'ACTIVE',
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    if (activeTab === 'approved') {
      const timer = setTimeout(() => {
        fetchStaff(pagination.page, search);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      fetchApplications();
    }
  }, [activeTab, search, pagination.page]);

  const fetchStaff = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get('/school-admin/staff', {
        params: { page, limit: 10, search: searchQuery },
      });
      if (res.data.success) {
        setStaff(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/school-admin/staff/applications', {
        params: { status: 'PENDING' },
      });
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      designation: '',
      qualification: '',
      salary: '',
      status: 'ACTIVE',
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingStaff(item);
    setForm({
      name: item.name,
      email: item.email || '',
      phone: item.phone,
      designation: item.designation,
      qualification: item.qualification || '',
      salary: item.salary ? item.salary.toString() : '',
      status: item.status,
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenApproveModal = (app) => {
    setAppToApprove(app);
    setApproveForm({
      designation: app.subjectsTaught ? `${app.subjectsTaught} Teacher` : 'Teacher',
      salary: app.expectedSalary ? app.expectedSalary.toString() : '42000',
    });
    setFormError('');
    setFormSuccess('');
    setIsApproveModalOpen(true);
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      const res = await api.post(`/school-admin/staff/applications/${appToApprove.id}/approve`, approveForm);
      if (res.data.success) {
        setFormSuccess(res.data.message);
        setTimeout(() => {
          setIsApproveModalOpen(false);
          setFormSuccess('');
          fetchApplications();
        }, 1200);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleRejectApp = async (app) => {
    if (!window.confirm(`Reject onboarding application from ${app.name}?`)) return;
    try {
      await api.post(`/school-admin/staff/applications/${app.id}/reject`);
      fetchApplications();
    } catch (err) {
      alert('Failed to reject application');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      if (editingStaff) {
        const res = await api.put(`/school-admin/staff/${editingStaff.id}`, form);
        if (res.data.success) setFormSuccess('Staff updated!');
      } else {
        const res = await api.post('/school-admin/staff', form);
        if (res.data.success) setFormSuccess('Staff added!');
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess('');
        fetchStaff(pagination.page, search);
      }, 700);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete staff member "${item.name}"?`)) return;

    try {
      const res = await api.delete(`/school-admin/staff/${item.id}`);
      if (res.data.success) {
        fetchStaff(pagination.page, search);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-4 space-y-3 pb-24">
      {/* 2 Segmented Tabs: Approved vs Pending Applications */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-black">
        <button
          onClick={() => setActiveTab('approved')}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            activeTab === 'approved' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Approved Faculty & Staff
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            activeTab === 'applications' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Onboarding Applications (Self-Portal)
        </button>
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            {activeTab === 'approved' ? 'Faculty Directory' : 'Pending Applications'}
          </h2>
          <p className="text-[11px] text-slate-500">
            {activeTab === 'approved'
              ? `Total Staff: ${pagination.totalRecords}`
              : `Pending Review: ${applications.length}`}
          </p>
        </div>
        {activeTab === 'approved' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff</span>
          </button>
        )}
      </div>

      {activeTab === 'approved' && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search teacher by name, EMP #, designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>
      )}

      {/* TAB 1: Approved Staff List */}
      {activeTab === 'approved' && (
        <div className="space-y-2.5">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : staff.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              No staff found. Tap "+ Add Staff" to register teachers.
            </div>
          ) : (
            staff.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 flex flex-col gap-2 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 font-black text-sm flex items-center justify-center">
                      {member.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {member.designation}
                        </span>
                        {member.employeeCode && (
                          <span className="font-mono text-[10px] text-slate-500 font-semibold">
                            {member.employeeCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-50"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(member)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="text-slate-500 font-medium">{member.qualification || 'Educator'}</span>
                  <div className="flex items-center gap-1 text-slate-700 font-semibold font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <a href={`tel:${member.phone}`} className="hover:underline">
                      {member.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}

          <Pagination
            pagination={pagination}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          />
        </div>
      )}

      {/* TAB 2: Pending Applications from Public Portal */}
      {activeTab === 'applications' && (
        <div className="space-y-2.5">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-7 h-7 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              No pending staff onboarding applications. Share your school link (/:slug/join-staff) with prospective teachers.
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-amber-200/80 shadow-xs p-3.5 flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Self-Onboarding Application
                    </span>
                    <h3 className="text-sm font-black text-slate-900 mt-1">{app.name}</h3>
                    <p className="text-xs text-slate-500">
                      Qualification: <strong className="text-slate-800">{app.highestQualification}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Subjects: <span className="font-semibold text-emerald-700">{app.subjectsTaught}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 block">
                      Exp: {app.experienceYears}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Expected: ₹{app.expectedSalary || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-600 space-y-0.5">
                  <div>Phone: {app.phone} • Email: {app.email}</div>
                  {app.aadharNo && <div>Aadhar: {app.aadharNo} • PAN: {app.panNo}</div>}
                  {app.bankName && <div>Bank: {app.bankName} (A/C: {app.accountNo})</div>}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleRejectApp(app)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleOpenApproveModal(app)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    1-Click Approve & Provision
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Add/Edit Staff Directly */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Edit Staff Details' : 'Register New Faculty'}
      >
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation *</label>
            <input
              type="text"
              required
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              placeholder="e.g. Senior PGT Teacher / Accountant / Peon"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Qualification</label>
              <input
                type="text"
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                placeholder="e.g. M.Sc, B.Ed"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Monthly Salary (₹)</label>
              <input
                type="number"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="e.g. 45000"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30"
            >
              Save Staff
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: 1-Click Approve Staff Application */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Staff Application"
      >
        <form onSubmit={handleApproveSubmit} className="space-y-3">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
              {formSuccess}
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-900">Applicant: {appToApprove?.name}</p>
            <p className="text-slate-500 font-mono">
              Phone: {appToApprove?.phone} • Email: {appToApprove?.email}
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold">
              * Note: A staff user account will be created automatically with password set to applicant's phone number!
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Official Designation *</label>
            <input
              type="text"
              required
              value={approveForm.designation}
              onChange={(e) => setApproveForm({ ...approveForm, designation: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Basic Monthly Salary (₹)</label>
            <input
              type="number"
              value={approveForm.salary}
              onChange={(e) => setApproveForm({ ...approveForm, salary: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApproveModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30"
            >
              Confirm Approval & Provision
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;
