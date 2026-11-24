import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Phone,
  Trash2,
  Edit2,
  User,
  Heart,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
} from 'lucide-react';

const Students = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' or 'pending'

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Approve Pending Application Modal
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [studentToApprove, setStudentToApprove] = useState(null);
  const [approveForm, setApproveForm] = useState({ rollNo: '', classId: '' });

  const [form, setForm] = useState({
    classId: '',
    admissionNo: '',
    rollNo: '',
    firstName: '',
    lastName: '',
    gender: 'MALE',
    dob: '',
    parentName: '',
    parentPhone: '',
    email: '',
    address: '',
    bloodGroup: 'B+',
    status: 'ACTIVE',
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(pagination.page, search, classFilter, activeTab === 'pending' ? 'PENDING' : 'ACTIVE');
    }, 300);
    return () => clearTimeout(timer);
  }, [search, classFilter, activeTab, pagination.page]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/school-admin/classes', { params: { limit: 100 } });
      if (res.data.success) {
        setClasses(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async (page = 1, searchQuery = '', classId = '', status = 'ACTIVE') => {
    setLoading(true);
    try {
      const res = await api.get('/school-admin/students', {
        params: { page, limit: 10, search: searchQuery, classId, status },
      });
      if (res.data.success) {
        setStudents(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setForm({
      classId: classes[0]?.id || '',
      admissionNo: '',
      rollNo: '',
      firstName: '',
      lastName: '',
      gender: 'MALE',
      dob: '',
      parentName: '',
      parentPhone: '',
      email: '',
      address: '',
      bloodGroup: 'B+',
      status: 'ACTIVE',
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setForm({
      classId: student.classId,
      admissionNo: student.admissionNo,
      rollNo: student.rollNo,
      firstName: student.firstName,
      lastName: student.lastName || '',
      gender: student.gender,
      dob: student.dob ? student.dob.split('T')[0] : '',
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      email: student.email || '',
      address: student.address || '',
      bloodGroup: student.bloodGroup || '',
      status: student.status,
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenApprove = (student) => {
    setStudentToApprove(student);
    setApproveForm({
      rollNo: student.rollNo.startsWith('TMP') ? '106' : student.rollNo,
      classId: student.classId,
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
      const res = await api.patch(`/school-admin/students/${studentToApprove.id}/approve`, approveForm);
      if (res.data.success) {
        setFormSuccess('Student application approved and enrolled!');
        setTimeout(() => {
          setIsApproveModalOpen(false);
          setFormSuccess('');
          fetchStudents(1, search, classFilter, 'PENDING');
        }, 800);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      if (editingStudent) {
        const res = await api.put(`/school-admin/students/${editingStudent.id}`, form);
        if (res.data.success) {
          setFormSuccess('Student updated successfully!');
        }
      } else {
        const res = await api.post('/school-admin/students', form);
        if (res.data.success) {
          setFormSuccess('Student enrolled successfully!');
        }
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess('');
        fetchStudents(pagination.page, search, classFilter, activeTab === 'pending' ? 'PENDING' : 'ACTIVE');
      }, 700);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete student "${student.firstName} ${student.lastName}"?`)) return;

    try {
      const res = await api.delete(`/school-admin/students/${student.id}`);
      if (res.data.success) {
        fetchStudents(pagination.page, search, classFilter, activeTab === 'pending' ? 'PENDING' : 'ACTIVE');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
    }
  };

  return (
    <div className="p-4 space-y-3 pb-24">
      {/* 2 Segmented Tabs: Enrolled vs Pending Verification */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-black">
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            activeTab === 'enrolled' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Enrolled Students
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            activeTab === 'pending' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Online Applications (Pending)
        </button>
      </div>

      {/* Top Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            {activeTab === 'enrolled' ? 'Student Directory' : 'Pending Verification'}
          </h2>
          <p className="text-[11px] text-slate-500">Total Count: {pagination.totalRecords}</p>
        </div>
        {activeTab === 'enrolled' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>New Student</span>
          </button>
        )}
      </div>

      {/* Search & Class Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll #, adm #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        {activeTab === 'enrolled' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setClassFilter('')}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                classFilter === ''
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              All Classes
            </button>
            {classes.map((c) => (
              <button
                key={c.id}
                onClick={() => setClassFilter(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  classFilter === c.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {c.name}-{c.section}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student Cards List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 mt-2">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            {activeTab === 'enrolled'
              ? 'No students found. Tap "+ New Student" to enroll.'
              : 'No pending online admission applications.'}
          </div>
        ) : (
          students.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 flex flex-col gap-2 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div
                  onClick={() => navigate(`/students/${s.id}`)}
                  className="flex items-center gap-2.5 cursor-pointer flex-1"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-800 font-black text-sm flex items-center justify-center border border-emerald-200/60">
                    {s.firstName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
                      {s.firstName} {s.lastName}
                      {s.status === 'PENDING' && (
                        <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Pending
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-500 font-mono">
                        Adm: {s.admissionNo}
                      </span>
                      {s.status === 'ACTIVE' && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Roll: {s.rollNo}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {s.status === 'PENDING' ? (
                    <button
                      onClick={() => handleOpenApprove(s)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                    >
                      Approve & Enroll
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/students/${s.id}`)}
                        title="View Profile"
                        className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-50"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Student details strip */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                    {s.classRoom ? `${s.classRoom.name} - ${s.classRoom.section}` : 'No Class'}
                  </span>
                  {s.bloodGroup && (
                    <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">
                      {s.bloodGroup}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <a href={`tel:${s.parentPhone}`} className="hover:underline text-slate-700 font-semibold">
                    {s.parentPhone}
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
      />

      {/* Modal: Enroll Student */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : 'Enroll New Student'}
      >
        <form onSubmit={handleSave} className="space-y-3">
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

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Class & Section *</label>
            <select
              required
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - Section {c.section}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Admission No</label>
              <input
                type="text"
                placeholder="Auto-generated if empty"
                value={form.admissionNo}
                onChange={(e) => setForm({ ...form, admissionNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Roll No *</label>
              <input
                type="text"
                required
                value={form.rollNo}
                onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                placeholder="e.g. 101"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Father / Parent Name</label>
              <input
                type="text"
                value={form.parentName}
                onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Parent Phone *</label>
              <input
                type="text"
                required
                value={form.parentPhone}
                onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
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
              {editingStudent ? 'Update' : 'Enroll'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Approve Pending Online Admission */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Online Admission"
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
            <p className="font-bold text-slate-900">
              Student: {studentToApprove?.firstName} {studentToApprove?.lastName}
            </p>
            <p className="text-slate-500 font-mono">
              Adm ID: {studentToApprove?.admissionNo} • Phone: {studentToApprove?.parentPhone}
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm Class & Section *</label>
            <select
              required
              value={approveForm.classId}
              onChange={(e) => setApproveForm({ ...approveForm, classId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - Section {c.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Assign Permanent Roll No *</label>
            <input
              type="text"
              required
              value={approveForm.rollNo}
              onChange={(e) => setApproveForm({ ...approveForm, rollNo: e.target.value })}
              placeholder="e.g. 106"
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
              Confirm Enrollment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
