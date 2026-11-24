import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import {
  Layers,
  Plus,
  Search,
  Users,
  DoorClosed,
  Edit2,
  Trash2,
  BookOpen,
  UserCheck,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  // Class Detail Modal (Dedicated 4 Tabs view)
  const [selectedClass, setSelectedClass] = useState(null);
  const [detailTab, setDetailTab] = useState('overview'); // overview, subjects, students, fee

  const [form, setForm] = useState({
    name: '',
    section: 'A',
    capacity: '40',
    roomNumber: '',
    classTeacherId: '',
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchStaffList();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClasses(pagination.page, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, pagination.page]);

  const fetchStaffList = async () => {
    try {
      const res = await api.get('/school-admin/staff', { params: { limit: 100 } });
      if (res.data.success) {
        setStaffList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClasses = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get('/school-admin/classes', {
        params: { page, limit: 10, search: searchQuery },
      });
      if (res.data.success) {
        setClasses(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingClass(null);
    setForm({
      name: '',
      section: 'A',
      capacity: '40',
      roomNumber: '',
      classTeacherId: staffList[0]?.id || '',
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingClass(item);
    setForm({
      name: item.name,
      section: item.section,
      capacity: item.capacity.toString(),
      roomNumber: item.roomNumber || '',
      classTeacherId: item.classTeacherId || '',
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenDetail = (item) => {
    setSelectedClass(item);
    setDetailTab('overview');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      if (editingClass) {
        const res = await api.put(`/school-admin/classes/${editingClass.id}`, form);
        if (res.data.success) {
          setFormSuccess('Class updated successfully!');
        }
      } else {
        const res = await api.post('/school-admin/classes', form);
        if (res.data.success) {
          setFormSuccess('Class created successfully!');
        }
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess('');
        fetchClasses(pagination.page, search);
      }, 700);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name} - ${item.section}"?`)) return;

    try {
      const res = await api.delete(`/school-admin/classes/${item.id}`);
      if (res.data.success) {
        fetchClasses(pagination.page, search);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete class');
    }
  };

  return (
    <div className="p-4 space-y-3 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Classes & Sections</h2>
          <p className="text-[11px] text-slate-500">Total Sections: {pagination.totalRecords}</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>New Class</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search class name, section, room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      {/* Classes List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 mt-2">Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No classes found. Tap "+ New Class" to create one.
          </div>
        ) : (
          classes.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col gap-2 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div
                  onClick={() => handleOpenDetail(c)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200/70 text-teal-800 font-black text-sm flex items-center justify-center">
                    {c.section}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                      {c.name} - Section {c.section}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      {c.roomNumber && (
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <DoorClosed className="w-3 h-3 text-slate-400" />
                          {c.roomNumber}
                        </span>
                      )}
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">
                        {c._count?.students || 0}/{c.capacity} Enrolled
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenDetail(c)}
                    title="View Class Roster & Subjects"
                    className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-50"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-50"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Class Teacher Strip */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold text-[11px]">
                    Teacher: {c.classTeacher?.name || 'Not Allocated'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg text-[11px]">
                  <BookOpen className="w-3 h-3 text-indigo-500" />
                  <span>{c._count?.assignments || 0} Subjects</span>
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

      {/* Modal: Add or Edit Class */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Edit Class' : 'Create New Class'}
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
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Class Name / Grade *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Class 10 or Nursery"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Section *</label>
              <input
                type="text"
                required
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value.toUpperCase() })}
                placeholder="A, B, C"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Capacity</label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Room Number</label>
            <input
              type="text"
              value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
              placeholder="e.g. Room 101"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Allocate Class Teacher
            </label>
            <select
              value={form.classTeacherId}
              onChange={(e) => setForm({ ...form, classTeacherId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="">No Class Teacher</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.designation})
                </option>
              ))}
            </select>
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
              {editingClass ? 'Update Class' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Dedicated Class Dashboard (4 Tabs) */}
      {selectedClass && (
        <Modal
          isOpen={Boolean(selectedClass)}
          onClose={() => setSelectedClass(null)}
          title={`${selectedClass.name} - Section ${selectedClass.section}`}
        >
          <div className="space-y-3">
            {/* 4 Tabs */}
            <div className="grid grid-cols-4 bg-slate-200/80 p-1 rounded-2xl text-[10px] font-black text-center">
              <button
                onClick={() => setDetailTab('overview')}
                className={`py-1.5 rounded-xl transition-all ${
                  detailTab === 'overview' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setDetailTab('subjects')}
                className={`py-1.5 rounded-xl transition-all ${
                  detailTab === 'subjects' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Subjects
              </button>
              <button
                onClick={() => setDetailTab('students')}
                className={`py-1.5 rounded-xl transition-all ${
                  detailTab === 'students' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setDetailTab('fee')}
                className={`py-1.5 rounded-xl transition-all ${
                  detailTab === 'fee' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Fees
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {detailTab === 'overview' && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Class Teacher:</span>
                  <span className="font-bold text-slate-800">
                    {selectedClass.classTeacher?.name || 'Not Allocated'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Room Number:</span>
                  <span className="font-bold text-slate-800">
                    {selectedClass.roomNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Enrollment:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedClass._count?.students || 0} of {selectedClass.capacity} Max Students
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: SUBJECTS */}
            {detailTab === 'subjects' && (
              <div className="space-y-2 text-xs">
                {selectedClass.assignments?.length === 0 ? (
                  <p className="text-slate-400 py-3 text-center">No subjects assigned yet.</p>
                ) : (
                  selectedClass.assignments?.map((a) => (
                    <div
                      key={a.id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center"
                    >
                      <div>
                        <h5 className="font-bold text-slate-900">{a.subject?.name}</h5>
                        <span className="text-[10px] text-slate-500">Teacher: {a.staff?.name}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {a.periodsPerWeek} Periods/wk
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: STUDENTS */}
            {detailTab === 'students' && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                  <span className="font-bold text-slate-700">Enrolled Students ({selectedClass._count?.students || 0})</span>
                  <Link
                    to="/students"
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Full Directory &rarr;
                  </Link>
                </div>
                <p className="text-[11px] text-slate-500">
                  To view and print individual student profiles or digital ID cards, navigate to the Student Directory.
                </p>
              </div>
            )}

            {/* TAB 4: FEES */}
            {detailTab === 'fee' && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-600">
                  Fee structures configured for base class <strong className="text-slate-900">"{selectedClass.name}"</strong> apply automatically to all students in section {selectedClass.section}.
                </p>
                <Link
                  to="/fee-structure"
                  className="block text-center py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs"
                >
                  Configure {selectedClass.name} Fee Structure
                </Link>
              </div>
            )}

            <button
              onClick={() => setSelectedClass(null)}
              className="w-full py-2 bg-slate-100 font-bold text-xs rounded-xl text-slate-700"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Classes;
