import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Percent,
  Calendar,
  Package,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/dashboard-summary');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ marginBottom: '1.5rem' }}>Operations Command Center</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="card skeleton" style={{ height: 110 }}></div>
          ))}
        </div>
      </div>
    );
  }

  const kpi = stats?.kpi || {};

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Operations Command Center</h1>
          <p>Real-time telemetry and rental lifecycle management metrics.</p>
        </div>
        <button onClick={fetchStats} className="btn btn-secondary btn-sm">
          Refresh Live Metrics
        </button>
      </div>

      {/* Critical Action Banner if Overdue Orders Exist */}
      {kpi.overdueRentals > 0 && (
        <div
          style={{
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} />
            <div>
              <strong style={{ display: 'block' }}>{kpi.overdueRentals} Overdue Rental(s) Require Attention</strong>
              <span style={{ fontSize: '0.85rem' }}>
                Equipment return deadlines have passed. Penalties are actively accruing.
              </span>
            </div>
          </div>
          <Link to="/admin/returns" className="btn btn-danger btn-sm">
            Process Overdue Returns <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Row 1: Operational Flow KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Active Rentals</span>
            <Layers size={18} color="var(--primary)" />
          </div>
          <p style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem' }}>{kpi.activeRentals || 0}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currently in customer hands</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Due Today</span>
            <Clock size={18} color="var(--warning)" />
          </div>
          <p style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem' }}>{kpi.rentalsDueToday || 0}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scheduled for return intake</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Overdue Rentals</span>
            <AlertTriangle size={18} color="var(--danger)" />
          </div>
          <p style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--danger)' }}>
            {kpi.overdueRentals || 0}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Late fees accruing</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--info)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Fleet Utilization</span>
            <Percent size={18} color="var(--info)" />
          </div>
          <p style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem' }}>{kpi.fleetUtilization || 0}%</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {kpi.rentedInventoryCount || 0} / {kpi.totalInventoryCount || 0} items rented
          </span>
        </div>
      </div>

      {/* Row 2: Financial Ledger KPIs */}
      <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Financial & Deposit Summary</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gross Rental Revenue</span>
          <p style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
            ₹{kpi.totalRevenue || 0}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Excludes held deposits</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security Deposits Held</span>
          <p style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--info)' }}>
            ₹{kpi.totalDepositsHeld || 0}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In custody awaiting return</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Deposits Refunded</span>
          <p style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--success)' }}>
            ₹{kpi.totalDepositsRefunded || 0}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Returned after inspection</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Late Fees Collected</span>
          <p style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--danger)' }}>
            ₹{kpi.totalLateFees || 0}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From overdue deductions</span>
        </div>
      </div>

      {/* Row 3: Operational Quick Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={18} color="var(--primary)" /> Today's Dispatch Schedule
          </h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {kpi.upcomingPickups || 0} orders scheduled for collection or driver route delivery today.
          </p>
          <Link to="/admin/pickups" className="btn btn-secondary btn-sm">
            Open Pickup & Dispatch Console <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RotateCcw size={18} color="var(--warning)" /> Return Intake & Inspections
          </h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {kpi.rentalsDueToday || 0} rentals due today. Perform checklist inspection and calculate net deposit refund.
          </p>
          <Link to="/admin/returns" className="btn btn-secondary btn-sm">
            Open Return Intake Console <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
