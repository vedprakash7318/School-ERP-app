import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, totalRecords, limit } = pagination;

  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-white border-t border-slate-100 text-xs text-slate-600">
      <div>
        <span>
          <span className="font-bold text-slate-900">{page}</span> /{' '}
          <span className="font-semibold text-slate-700">{totalPages}</span> ({totalRecords} items)
        </span>
      </div>

      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-2 font-bold text-emerald-700">{page}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
