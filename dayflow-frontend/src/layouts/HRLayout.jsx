import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

export const HRLayout = () => {
  const { user, loading, isAuthenticated, isHR } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader text="Loading HR Command Center..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isHR) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="app-layout">
      {/* HR Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      {/* Main Content */}
      <div className="main-content-wrapper">
        <Topbar onToggleMobile={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HRLayout;
