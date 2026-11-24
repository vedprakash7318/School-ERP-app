import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  GraduationCap,
  CreditCard,
  Layers,
  Users2,
  Settings,
} from 'lucide-react';

const BottomNav = () => {
  const tabs = [
    { to: '/', label: 'Home', icon: LayoutGrid, end: true },
    { to: '/students', label: 'Students', icon: GraduationCap },
    { to: '/fees', label: 'Fees', icon: CreditCard },
    { to: '/classes', label: 'Classes', icon: Layers },
    { to: '/staff', label: 'Staff', icon: Users2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] sm:max-w-inherit mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around z-40 shadow-lg shadow-slate-900/10">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-90 ${
                isActive
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-emerald-50 text-emerald-600' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
