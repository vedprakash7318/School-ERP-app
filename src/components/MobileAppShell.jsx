import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

const MobileAppShell = ({ children }) => {
  // Mode: 'mobile' (430px max), 'tablet' (768px max), 'fluid' (100% full screen)
  const [deviceMode, setDeviceMode] = useState('mobile');

  const widthClasses = {
    mobile: 'max-w-[430px]',
    tablet: 'max-w-[768px]',
    fluid: 'max-w-4xl',
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start sm:p-4 select-none">
      {/* Device frame switcher bar visible on large screens */}
      <div className="hidden lg:flex items-center justify-between w-full max-w-4xl mb-3 px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            School Admin App View
          </span>
          <span className="text-slate-500 text-[11px]">(Designed specifically for Phone & Tablet)</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              deviceMode === 'mobile'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'hover:text-slate-200 text-slate-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone (430px)</span>
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              deviceMode === 'tablet'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'hover:text-slate-200 text-slate-400'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet (768px)</span>
          </button>
          <button
            onClick={() => setDeviceMode('fluid')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              deviceMode === 'fluid'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'hover:text-slate-200 text-slate-400'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Width</span>
          </button>
        </div>
      </div>

      {/* Main Mobile/Tablet Device Container */}
      <div
        className={`w-full ${widthClasses[deviceMode]} bg-slate-50 min-h-screen sm:min-h-[880px] sm:max-h-[92vh] sm:rounded-[36px] sm:shadow-2xl sm:shadow-emerald-950/40 sm:border-[8px] sm:border-slate-800 flex flex-col relative overflow-hidden transition-all duration-300`}
      >
        {/* Subtle camera / speaker notch bar for phone preview */}
        <div className="hidden sm:flex justify-center pt-2 pb-1 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="w-24 h-4 bg-slate-200 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
          </div>
        </div>

        {/* App Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto pb-20 no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileAppShell;
