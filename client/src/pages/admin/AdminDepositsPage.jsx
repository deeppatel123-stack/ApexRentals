import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDepositsPage = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const res = await api.get('/deposits');
      setDeposits(res.data.data.deposits);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem' }}>Security Deposits Reconciliation</h1>
        <p>Audit held custodial security deposits, inspection deductions, and net refunded amounts.</p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Held Status</th>
              <th>Initial Deposit</th>
              <th>Total Deductions</th>
              <th>Refunded Amount</th>
              <th>Settled At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((dep) => (
              <tr key={dep._id}>
                <td>
                  <strong>#{dep.orderId?.orderNumber}</strong>
                </td>
                <td>
                  <strong>{dep.customerId?.name}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {dep.customerId?.email}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      dep.heldStatus === 'fully_refunded'
                        ? 'badge-success'
                        : dep.heldStatus === 'partially_refunded'
                        ? 'badge-warning'
                        : dep.heldStatus === 'held'
                        ? 'badge-info'
                        : 'badge-danger'
                    }`}
                  >
                    {dep.heldStatus.replace('_', ' ')}
                  </span>
                </td>
                <td>₹{dep.initialAmount}</td>
                <td style={{ color: dep.totalDeductions > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                  {dep.totalDeductions > 0 ? `-₹${dep.totalDeductions}` : '₹0'}
                </td>
                <td style={{ color: 'var(--success)', fontWeight: 700 }}>₹{dep.refundedAmount}</td>
                <td>
                  {dep.settledAt ? new Date(dep.settledAt).toLocaleDateString() : 'Awaiting Return'}
                </td>
                <td>
                  <Link to={`/rentals/${dep.orderId?._id}`} className="btn btn-secondary btn-sm">
                    View Ledger <ArrowRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDepositsPage;
