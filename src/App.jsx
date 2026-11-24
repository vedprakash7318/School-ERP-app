import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MobileAppShell from './components/MobileAppShell';
import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';

// Public Portals
import PublicAdmission from './pages/PublicAdmission';
import PublicJoinStaff from './pages/PublicJoinStaff';
import Login from './pages/Login';

// Protected App Pages
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';
import Staff from './pages/Staff';
import Fees from './pages/Fees';
import FeeStructure from './pages/FeeStructure';
import Sessions from './pages/Sessions';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !['PRINCIPAL', 'SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MobileAppShell>
      <AppHeader />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/fee-structure" element={<FeeStructure />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </MobileAppShell>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Online Admission and Staff Join Routes */}
          <Route path="/:slug/admission" element={<PublicAdmission />} />
          <Route path="/:slug/join-staff" element={<PublicJoinStaff />} />
          <Route path="/:slug/login" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Protected School Admin Mobile App Shell */}
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
