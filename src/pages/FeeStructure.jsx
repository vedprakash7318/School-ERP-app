import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Check,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FeeStructure = () => {
  const [structures, setStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    className: '',
    billingCycle: 'MONTHLY',
    heads: [
      { name: 'Tuition Fee (Monthly)', amount: '2500', frequency: 12 },
      { name: 'Exam & Term Fee', amount: '2000', frequency: 1 },
      { name: 'Computer & Lab Fee', amount: '1200', frequency: 4 },
    ],
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStruct, resClasses] = await Promise.all([
        api.get('/school-admin/fee-structures'),
        api.get('/school-admin/classes', { params: { limit: 100 } }),
      ]);
      if (resStruct.data.success) {
        setStructures(resStruct.data.data);
        setActiveSession(resStruct.data.activeSession);
      }
      if (resClasses.data.success) {
        // extract distinct base class names e.g. "Class 10", "Class 9"
        const distinctNames = Array.from(new Set(resClasses.data.data.map((c) => c.name)));
        setClasses(distinctNames);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setForm({
      className: classes[0] || 'Class 10',
      billingCycle: 'MONTHLY',
      heads: [
        { name: 'Tuition Fee (Monthly)', amount: '2500', frequency: 12 },
        { name: 'Exam & Term Fee', amount: '2000', frequency: 1 },
        { name: 'Computer & Lab Fee', amount: '1200', frequency: 4 },
      ],
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleAddHead = () => {
    setForm((prev) => ({
      ...prev,
      heads: [...prev.heads, { name: '', amount: '', frequency: 1 }],
    }));
  };

  const handleRemoveHead = (idx) => {
    setForm((prev) => ({
      ...prev,
      heads: prev.heads.filter((_, i) => i !== idx),
    }));
  };

  const handleHeadChange = (idx, field, val) => {
    setForm((prev) => {
      const updated = [...prev.heads];
      updated[idx][field] = val;
      return { ...prev, heads: updated };
    });
  };

  // Calculate annual total
  const calculatedTotal = form.heads.reduce((sum, h) => {
    const amt = parseFloat(h.amount) || 0;
    const freq = parseInt(h.frequency) || 1;
    return sum + amt * freq;
  }, 0);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!activeSession) {
      alert('Please create and activate an academic session first.');
      return;
    }

    setFormError('');
    setFormSuccess('');

    try {
      const res = await api.post('/school-admin/fee-structures', {
        ...form,
        academicSessionId: activeSession.id,
      });
      if (res.data.success) {
        setFormSuccess('Fee structure saved!');
        setTimeout(() => {
          setIsModalOpen(false);
          setFormSuccess('');
          fetchData();
        }, 700);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save fee structure');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fee structure?')) return;
    try {
      const res = await api.delete(`/school-admin/fee-structures/${id}`);
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Class Fee Structures</h2>
          <p className="text-[11px] text-slate-500">
            Session: <span className="font-bold text-emerald-700">{activeSession?.name || 'None Active'}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/fees"
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            &larr; Receipts
          </Link>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Create Structure</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : structures.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No fee structures defined yet. Tap "+ Create Structure" to define heads.
          </div>
        ) : (
          structures.map((st) => (
            <div
              key={st.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">{st.className}</h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {st.billingCycle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Applies automatically to all sections of {st.className}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-emerald-800 block">
                    ₹{st.totalAnnualFee}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Annual Total</span>
                </div>
              </div>

              {/* Heads Pill Table */}
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 divide-y divide-slate-200/60 text-xs">
                {st.heads?.map((h) => (
                  <div key={h.id} className="py-1 flex justify-between items-center">
                    <span className="text-slate-700 font-medium">{h.name}</span>
                    <span className="font-mono text-slate-900 font-bold">
                      ₹{h.amount} <span className="text-[10px] text-slate-400 font-normal">x {h.frequency}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleDelete(st.id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 p-1 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Structure</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Fee Structure */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configure Class Fee Structure"
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Class *</label>
              <input
                type="text"
                required
                value={form.className}
                onChange={(e) => setForm({ ...form, className: e.target.value })}
                placeholder="e.g. Class 10"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Billing Cycle</label>
              <select
                value={form.billingCycle}
                onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="HALF_YEARLY">Half-Yearly</option>
                <option value="ANNUALLY">Annually</option>
                <option value="ONE_TIME">One-Time</option>
              </select>
            </div>
          </div>

          {/* Fee Heads Dynamic List */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-emerald-800">Fee Heads Breakdown</span>
              <button
                type="button"
                onClick={handleAddHead}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Head
              </button>
            </div>

            {form.heads.map((head, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  required
                  placeholder="Head Name (e.g. Tuition)"
                  value={head.name}
                  onChange={(e) => handleHeadChange(i, 'name', e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="number"
                  required
                  placeholder="₹ Amount"
                  value={head.amount}
                  onChange={(e) => handleHeadChange(i, 'amount', e.target.value)}
                  className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
                <select
                  value={head.frequency}
                  onChange={(e) => handleHeadChange(i, 'frequency', e.target.value)}
                  className="w-20 px-1 py-1.5 border border-slate-200 rounded-lg text-[11px] font-semibold"
                >
                  <option value={12}>x12 (Mo)</option>
                  <option value={4}>x4 (Qtr)</option>
                  <option value={2}>x2 (Half)</option>
                  <option value={1}>x1 (Yr)</option>
                </select>
                {form.heads.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveHead(i)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            <div className="pt-2 flex justify-between font-black text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-800">Total Calculated Annual Fee:</span>
              <span className="text-emerald-800">₹{calculatedTotal}</span>
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
              Save Fee Structure
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeStructure;
