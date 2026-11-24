import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import {
  CreditCard,
  Plus,
  Search,
  Printer,
  CheckCircle,
  Clock,
  ArrowRight,
  School,
  User,
  Filter,
  DollarSign,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Fees = () => {
  const [receipts, setReceipts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Collect Fee Modal
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentLedger, setStudentLedger] = useState(null);

  const [collectForm, setCollectForm] = useState({
    studentId: '',
    amountPaid: '',
    paymentMode: 'CASH',
    transactionRef: '',
    remarks: '',
  });

  // Printable Receipt Modal
  const [printableReceipt, setPrintableReceipt] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReceipts(pagination.page, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, pagination.page]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/school-admin/students', { params: { limit: 100 } });
      if (res.data.success) {
        setStudentsList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReceipts = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get('/school-admin/fees/receipts', {
        params: { page, limit: 10, search: searchQuery },
      });
      if (res.data.success) {
        setReceipts(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCollect = () => {
    setSelectedStudent(null);
    setStudentLedger(null);
    setCollectForm({
      studentId: '',
      amountPaid: '',
      paymentMode: 'CASH',
      transactionRef: '',
      remarks: '',
    });
    setFormError('');
    setFormSuccess('');
    setIsCollectModalOpen(true);
  };

  const handleStudentSelect = async (studentId) => {
    setCollectForm((prev) => ({ ...prev, studentId }));
    const found = studentsList.find((s) => s.id === studentId);
    setSelectedStudent(found);

    if (studentId) {
      try {
        const res = await api.get(`/school-admin/fees/student-ledger/${studentId}`);
        if (res.data.success) {
          setStudentLedger(res.data.data);
          // Suggest paying remaining due if available
          if (res.data.data.pendingDue > 0) {
            setCollectForm((prev) => ({ ...prev, amountPaid: res.data.data.pendingDue.toString() }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setStudentLedger(null);
    }
  };

  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      const res = await api.post('/school-admin/fees/collect', collectForm);
      if (res.data.success) {
        setFormSuccess('Fee collected! Opening receipt...');
        setTimeout(() => {
          setIsCollectModalOpen(false);
          setFormSuccess('');
          fetchReceipts(1, search);
          handleViewReceipt(res.data.data.id);
        }, 800);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to collect fee');
    }
  };

  const handleViewReceipt = async (receiptId) => {
    try {
      const res = await api.get(`/school-admin/fees/receipts/${receiptId}`);
      if (res.data.success) {
        setPrintableReceipt(res.data.data);
        setIsPrintModalOpen(true);
      }
    } catch (err) {
      alert('Failed to load receipt details');
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Fee Accounting</h2>
          <p className="text-[11px] text-slate-500">Collect fees, ledger tracking & receipts</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/fee-structure"
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Fee Structures
          </Link>
          <button
            onClick={handleOpenCollect}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Collect Fee</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search receipt #, student name, admission #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      {/* Receipts List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : receipts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No fee receipts logged yet. Tap "+ Collect Fee" to issue a receipt.
          </div>
        ) : (
          receipts.map((r) => (
            <div
              key={r.id}
              onClick={() => handleViewReceipt(r.id)}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 flex flex-col gap-2 hover:border-emerald-300 transition-colors cursor-pointer active:scale-98"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {r.receiptNo}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                    {r.student?.firstName} {r.student?.lastName}
                  </h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>Adm: {r.student?.admissionNo}</span>
                    <span>•</span>
                    <span>
                      {r.student?.classRoom?.name}-{r.student?.classRoom?.section}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-900 block">₹{r.amountPaid}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-1.5 py-0.2 rounded">
                    {r.paymentMode}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{new Date(r.paymentDate).toLocaleDateString()}</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Printer className="w-3.5 h-3.5" />
                  View & Print Receipt
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
      />

      {/* Modal: Collect Fee */}
      <Modal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        title="Collect Fee & Issue Receipt"
      >
        <form onSubmit={handleCollectSubmit} className="space-y-3">
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
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Student *</label>
            <select
              required
              value={collectForm.studentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="">Select Student to Collect Fee</option>
              {studentsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} (Roll #{s.rollNo} • Adm #{s.admissionNo})
                </option>
              ))}
            </select>
          </div>

          {/* Student Balance Info Strip */}
          {studentLedger && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Annual Fee:</span>
                <span className="font-bold text-slate-900">₹{studentLedger.totalAnnualFee}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Paid So Far:</span>
                <span className="font-bold text-emerald-700">₹{studentLedger.totalPaid}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-emerald-200/60 font-extrabold text-sm">
                <span className="text-slate-800">Pending Balance:</span>
                <span className={studentLedger.pendingDue > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                  ₹{studentLedger.pendingDue}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Amount Paid (₹ INR) *</label>
            <input
              type="number"
              required
              min="1"
              value={collectForm.amountPaid}
              onChange={(e) => setCollectForm({ ...collectForm, amountPaid: e.target.value })}
              placeholder="e.g. 5400"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Mode *</label>
              <select
                value={collectForm.paymentMode}
                onChange={(e) => setCollectForm({ ...collectForm, paymentMode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI / QR</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Ref / UTR Number</label>
              <input
                type="text"
                value={collectForm.transactionRef}
                onChange={(e) => setCollectForm({ ...collectForm, transactionRef: e.target.value })}
                placeholder="UPI Ref, Cheque #"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Remarks / Note</label>
            <input
              type="text"
              value={collectForm.remarks}
              onChange={(e) => setCollectForm({ ...collectForm, remarks: e.target.value })}
              placeholder="e.g. Q1 Tuition Fee paid"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCollectModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30"
            >
              Collect & Print Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Professional Fee Receipt Modal */}
      {printableReceipt && (
        <Modal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Fee Receipt Slip"
        >
          <div className="space-y-4">
            {/* Printable Area */}
            <div id="receipt-print-area" className="p-4 bg-white border border-slate-300 rounded-2xl space-y-3 text-xs">
              {/* Receipt Header */}
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  {printableReceipt.school?.name}
                </h2>
                <p className="text-[10px] text-slate-500 font-medium">
                  {printableReceipt.school?.address || 'Institutional Area'}, {printableReceipt.school?.city || 'Delhi'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Phone: {printableReceipt.school?.phone}
                </p>
                <span className="inline-block mt-1 text-[11px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Fee Receipt / Acknowledgment Slip
                </span>
              </div>

              {/* Receipt Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-200 pb-2.5">
                <div>
                  <span className="text-slate-400 block text-[10px]">Receipt No:</span>
                  <span className="font-mono font-bold text-slate-900">{printableReceipt.receiptNo}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Date:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {new Date(printableReceipt.paymentDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Student Details */}
              <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-200 pb-2.5">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Name:</span>
                  <span className="font-bold text-slate-900">
                    {printableReceipt.student?.firstName} {printableReceipt.student?.lastName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Class & Section:</span>
                  <span className="font-bold text-slate-900">
                    {printableReceipt.student?.classRoom?.name} - {printableReceipt.student?.classRoom?.section}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Admission No:</span>
                  <span className="font-mono font-semibold text-slate-700">
                    {printableReceipt.student?.admissionNo}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Roll No:</span>
                  <span className="font-mono font-semibold text-slate-700">
                    {printableReceipt.student?.rollNo}
                  </span>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="space-y-1 py-1">
                <div className="flex justify-between items-center text-sm font-black border-y border-slate-200 py-1.5">
                  <span className="text-slate-900">Amount Received ({printableReceipt.paymentMode}):</span>
                  <span className="text-emerald-800 text-base">₹{printableReceipt.amountPaid}</span>
                </div>

                <div className="pt-1 text-[11px]">
                  <span className="text-slate-400 font-semibold block text-[10px]">Amount in Words:</span>
                  <span className="font-bold text-slate-800 italic">
                    "{printableReceipt.amountInWords}"
                  </span>
                </div>

                {printableReceipt.transactionRef && (
                  <div className="text-[11px]">
                    <span className="text-slate-400">Payment Reference: </span>
                    <span className="font-mono font-bold text-slate-700">{printableReceipt.transactionRef}</span>
                  </div>
                )}
              </div>

              {/* Remaining Balance Strip */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] flex justify-between items-center">
                <span className="text-slate-600">Remaining Balance Pending:</span>
                <span className="font-black text-rose-700">₹{printableReceipt.pendingDue || 0}</span>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex justify-between text-[10px] text-slate-400">
                <span className="border-t border-slate-300 pt-1">Cashier / Staff Signature</span>
                <span className="border-t border-slate-300 pt-1">Authorized Seal</span>
              </div>
            </div>

            {/* Print Action */}
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Professional Receipt</span>
              </button>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-3 border border-slate-300 text-slate-700 font-bold text-xs rounded-2xl hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Fees;
