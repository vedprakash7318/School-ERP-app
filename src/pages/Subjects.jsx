import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  Layers,
  Users2,
  Calendar,
  Edit2,
  Trash2,
  ArrowRight,
} from 'lucide-react';

const Subjects = () => {
  // Active Tab: 'subjects' or 'assignments'
  const [activeTab, setActiveTab] = useState('subjects');

  // Subjects state
  const [subjects, setSubjects] = useState([]);
  const [subjectPagination, setSubjectPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
  const [subjectSearch, setSubjectSearch] = useState('');
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', type: 'THEORY' });

  // Assignments state
  const [assignments, setAssignments] = useState([]);
  const [assignmentPagination, setAssignmentPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ classId: '', subjectId: '', staffId: '', periodsPerWeek: '5' });

  // Dropdown lists
  const [classesList, setClassesList] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchClassesAndStaff();
  }, []);

  useEffect(() => {
    if (activeTab === 'subjects') {
      const timer = setTimeout(() => {
        fetchSubjects(subjectPagination.page, subjectSearch);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      fetchAssignments(assignmentPagination.page);
    }
  }, [activeTab, subjectSearch, subjectPagination.page, assignmentPagination.page]);

  const fetchClassesAndStaff = async () => {
    try {
      const [resC, resS] = await Promise.all([
        api.get('/school-admin/classes', { params: { limit: 100 } }),
        api.get('/school-admin/staff', { params: { limit: 100 } }),
      ]);
      if (resC.data.success) setClassesList(resC.data.data);
      if (resS.data.success) setStaffList(resS.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get('/school-admin/subjects', {
        params: { page, limit: 10, search: searchQuery },
      });
      if (res.data.success) {
        setSubjects(res.data.data);
        setSubjectPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/school-admin/assignments', {
        params: { page, limit: 10 },
      });
      if (res.data.success) {
        setAssignments(res.data.data);
        setAssignmentPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Subject CRUD
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectForm({ name: '', code: '', type: 'THEORY' });
    setFormError('');
    setFormSuccess('');
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (item) => {
    setEditingSubject(item);
    setSubjectForm({ name: item.name, code: item.code || '', type: item.type });
    setFormError('');
    setFormSuccess('');
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      if (editingSubject) {
        const res = await api.put(`/school-admin/subjects/${editingSubject.id}`, subjectForm);
        if (res.data.success) setFormSuccess('Subject updated!');
      } else {
        const res = await api.post('/school-admin/subjects', subjectForm);
        if (res.data.success) setFormSuccess('Subject created!');
      }

      setTimeout(() => {
        setIsSubjectModalOpen(false);
        setFormSuccess('');
        fetchSubjects(subjectPagination.page, subjectSearch);
      }, 700);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteSubject = async (item) => {
    if (!window.confirm(`Delete subject "${item.name}"?`)) return;

    try {
      const res = await api.delete(`/school-admin/subjects/${item.id}`);
      if (res.data.success) {
        fetchSubjects(subjectPagination.page, subjectSearch);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  // Assignment logic
  const handleOpenAssign = () => {
    setAssignForm({
      classId: classesList[0]?.id || '',
      subjectId: subjects[0]?.id || '',
      staffId: staffList[0]?.id || '',
      periodsPerWeek: '5',
    });
    setFormError('');
    setFormSuccess('');
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      const res = await api.post('/school-admin/assignments', assignForm);
      if (res.data.success) {
        setFormSuccess('Subject assigned successfully!');
        setTimeout(() => {
          setIsAssignModalOpen(false);
          setFormSuccess('');
          fetchAssignments(1);
        }, 700);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleDeleteAssignment = async (item) => {
    if (!window.confirm('Remove this subject assignment?')) return;

    try {
      const res = await api.delete(`/school-admin/assignments/${item.id}`);
      if (res.data.success) {
        fetchAssignments(assignmentPagination.page);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-4 space-y-3 pb-24">
      {/* Segmented Top Switcher */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all ${
            activeTab === 'subjects'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Curriculum Subjects
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all ${
            activeTab === 'assignments'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Teacher Assignments
        </button>
      </div>

      {/* Tab 1: Curriculum Subjects */}
      {activeTab === 'subjects' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Subjects</h2>
              <p className="text-[11px] text-slate-500">
                Total Courses: {subjectPagination.totalRecords}
              </p>
            </div>
            <button
              onClick={handleOpenAddSubject}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>New Subject</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subjects by name or code..."
              value={subjectSearch}
              onChange={(e) => setSubjectSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : subjects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                No subjects found. Tap "+ New Subject" to add.
              </div>
            ) : (
              subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 flex items-center justify-between hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/60 text-indigo-700 font-black text-xs flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                        {sub.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                        {sub.code && (
                          <span className="font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {sub.code}
                          </span>
                        )}
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          {sub.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditSubject(sub)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(sub)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination
            pagination={subjectPagination}
            onPageChange={(page) => setSubjectPagination((prev) => ({ ...prev, page }))}
          />
        </div>
      )}

      {/* Tab 2: Teacher Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Subject Assignments</h2>
              <p className="text-[11px] text-slate-500">
                Link subject to class and faculty teacher
              </p>
            </div>
            <button
              onClick={handleOpenAssign}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Subject</span>
            </button>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : assignments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                No assignments created yet. Tap "+ Assign Subject" to map teachers to classes.
              </div>
            ) : (
              assignments.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 flex flex-col gap-2 hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {a.classRoom?.name} - {a.classRoom?.section}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 mt-1">
                        {a.subject?.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleDeleteAssignment(a)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Users2 className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-bold text-slate-800">{a.staff?.name}</span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-semibold font-mono">
                      {a.periodsPerWeek} Periods/wk
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination
            pagination={assignmentPagination}
            onPageChange={(page) => setAssignmentPagination((prev) => ({ ...prev, page }))}
          />
        </div>
      )}

      {/* Modal: Add or Edit Subject */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleSaveSubject} className="space-y-3">
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
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              placeholder="e.g. Mathematics, Science"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject Code</label>
              <input
                type="text"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. MATH-10"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject Type</label>
              <select
                value={subjectForm.type}
                onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="THEORY">Theory</option>
                <option value="PRACTICAL">Practical</option>
                <option value="BOTH">Theory & Practical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30"
            >
              {editingSubject ? 'Update' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Subject */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Subject to Class & Teacher"
      >
        <form onSubmit={handleSaveAssignment} className="space-y-3">
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
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Class *</label>
            <select
              required
              value={assignForm.classId}
              onChange={(e) => setAssignForm({ ...assignForm, classId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="">Select Target Class</option>
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - Section {c.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Subject *</label>
            <select
              required
              value={assignForm.subjectId}
              onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code || s.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Teacher (Staff) *</label>
            <select
              required
              value={assignForm.staffId}
              onChange={(e) => setAssignForm({ ...assignForm, staffId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="">Select Teacher</option>
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} — {st.designation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Periods Per Week</label>
            <input
              type="number"
              min="1"
              max="25"
              value={assignForm.periodsPerWeek}
              onChange={(e) => setAssignForm({ ...assignForm, periodsPerWeek: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Subjects;
