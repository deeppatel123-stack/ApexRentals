import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export const CustomerLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <Outlet />
      </main>
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface)',
          padding: '1.5rem 0',
          marginTop: 'auto',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <p>© 2026 Apex Rentals & Logistics Ltd. Enterprise Rental Operations.</p>
          <p>MERN Stack + Predictive ML Architecture</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
