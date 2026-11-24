import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Trash2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    setAsActive: true,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/school-admin/sessions');
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    const currentYear = new Date().getFullYear();
    setForm({
      name: `${currentYear}-${currentYear + 1}`,
      startDate: `${currentYear}-04-01`,
      endDate: `${currentYear + 1}-03-31`,
      setAsActive: true,
    });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/school-admin/sessions', form);
      if (res.data.success) {
        setSuccess('Academic Session created successfully!');
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess('');
          fetchSessions();
        }, 800);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create session');
    }
  };

  const handleActivate = async (session) => {
    if (session.isActive) return;
    if (!window.confirm(`Switch active academic session to "${session.name}"?`)) return;

    try {
      const res = await api.patch(`/school-admin/sessions/${session.id}/activate`);
      if (res.data.success) {
        fetchSessions();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate session');
    }
  };

  const handleDelete = async (session) => {
    if (session.isActive) {
      alert('Cannot delete the currently active session.');
      return;
    }
    if (!window.confirm(`Delete session "${session.name}"?`)) return;

    try {
      const res = await api.delete(`/school-admin/sessions/${session.id}`);
      if (res.data.success) {
        fetchSessions();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Academic Sessions</h2>
          <p className="text-[11px] text-slate-500">Manage school academic years & term dates</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col gap-3 transition-all ${
                s.isActive ? 'border-emerald-500 ring-2 ring-emerald-500/15' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm border ${
                      s.isActive
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{s.name}</h3>
                      {s.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Active Session
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {new Date(s.startDate).toLocaleDateString()} &rarr;{' '}
                      {new Date(s.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {!s.isActive && (
                  <button
                    onClick={() => handleDelete(s)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Counts & Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-600 flex items-center gap-3">
                  <span>
                    <strong className="text-slate-900">{s._count?.students || 0}</strong> Students
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-900">{s._count?.feePayments || 0}</strong> Receipts
                  </span>
                </div>

                {!s.isActive ? (
                  <button
                    onClick={() => handleActivate(s)}
                    className="px-3 py-1 bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all"
                  >
                    Set as Active
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Current Active</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: New Academic Session */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Academic Session"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
              {success}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Session Name (e.g. 2026-2027) *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="2026-2027"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.setAsActive}
                onChange={(e) => setForm({ ...form, setAsActive: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-800">
                Immediately activate this academic session
              </span>
            </label>
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
              Create Session
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sessions;
