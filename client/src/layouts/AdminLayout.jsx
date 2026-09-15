import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';

export const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <AdminSidebar />
        <main style={{ flex: 1, padding: '2rem', backgroundColor: 'var(--bg-secondary)', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
