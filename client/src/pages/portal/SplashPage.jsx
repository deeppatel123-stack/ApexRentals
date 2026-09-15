import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Package,
  Layers,
} from 'lucide-react';

export const SplashPage = () => {
  const { user, login } = useAuth();

  const handleQuickLogin = async (email, password) => {
    try {
      await login(email, password);
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <div
          className="badge badge-info"
          style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
        >
          <Sparkles size={14} /> Production-Grade Rental Operations Platform
        </div>
        <h1
          style={{
            fontSize: '3.25rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            marginBottom: '1.25rem',
          }}
        >
          Streamlined Equipment Rentals,{' '}
          <span style={{ color: 'var(--primary)' }}>End-to-End.</span>
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          Reserve premium cinema cameras, professional AV gear, power generators, and industrial tools with real-time date availability, automated security deposit reconciliation, and AI-powered operations.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/catalog" className="btn btn-primary btn-lg">
            Explore Rental Catalog <ArrowRight size={18} />
          </Link>
          {!user && (
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In to Portal
            </Link>
          )}
        </div>

        {/* Quick Demo Switcher Card */}
        <div
          className="card"
          style={{
            marginTop: '3.5rem',
            textAlign: 'left',
            maxWidth: 680,
            margin: '3.5rem auto 0',
            border: '1px solid var(--primary-border)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Layers size={18} color="var(--primary)" />
            <h4 style={{ fontSize: '1rem' }}>Instant Demo Authentication Sandbox</h4>
          </div>
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Test the complete system using pre-seeded roles with verified sample orders and permissions:
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleQuickLogin('admin@rental.com', 'admin123')}
              className="btn btn-primary btn-sm"
            >
              👑 Login as Admin
            </button>
            <button
              onClick={() => handleQuickLogin('john@example.com', 'customer123')}
              className="btn btn-secondary btn-sm"
            >
              👤 Login as Customer (John)
            </button>
            <button
              onClick={() => handleQuickLogin('sarah@example.com', 'customer123')}
              className="btn btn-secondary btn-sm"
            >
              ⭐ Login as VIP (Sarah - Overdue Order)
            </button>
          </div>
        </div>
      </section>

      {/* Feature Lifecycle Grid */}
      <section className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '1.75rem' }}>
          Complete Verified Rental Lifecycle
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <Clock size={28} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h3>Real-Time Availability</h3>
            <p style={{ marginTop: '0.5rem' }}>
              Micro-scheduled hour and day reservations prevent double booking with a mandatory 1-hour turnaround inspection buffer.
            </p>
          </div>

          <div className="card">
            <ShieldCheck size={28} color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h3>Automated Deposit Settlement</h3>
            <p style={{ marginTop: '0.5rem' }}>
              Refundable deposits are securely held and automatically refunded or deducted for damages and late returns with full receipt ledger.
            </p>
          </div>

          <div className="card">
            <Truck size={28} color="var(--info)" style={{ marginBottom: '1rem' }} />
            <h3>Pickups & Smart Dispatch</h3>
            <p style={{ marginTop: '0.5rem' }}>
              QR code verification, physical serial asset scanning, and AI-optimized delivery routing for multi-customer doorstep dispatches.
            </p>
          </div>

          <div className="card">
            <RotateCcw size={28} color="var(--warning)" style={{ marginBottom: '1rem' }} />
            <h3>Return & Late Fee Engine</h3>
            <p style={{ marginTop: '0.5rem' }}>
              Automated grace-period calculations, condition inspection checklists, and instant work-order initiation for maintenance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SplashPage;
