import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Wrench,
  Clock,
  DollarSign,
} from 'lucide-react';

export const AdminReturnsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Return Intake Form State
  const [damageSeverity, setDamageSeverity] = useState('none');
  const [damageNotes, setDamageNotes] = useState('');
  const [repairCost, setRepairCost] = useState(0);
  const [missingFee, setMissingFee] = useState(0);
  const [actualReturnDate, setActualReturnDate] = useState(new Date().toISOString().slice(0, 16));

  useEffect(() => {
    fetchReturnsQueue();
  }, []);

  const fetchReturnsQueue = async () => {
    try {
      // Fetch both active and overdue orders
      const resActive = await api.get('/rentals/admin/all?status=active');
      const resOverdue = await api.get('/rentals/admin/all?status=overdue');
      setOrders([...resOverdue.data.data.orders, ...resActive.data.data.orders]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenIntake = (order) => {
    setSelectedOrder(order);
    setDamageSeverity('none');
    setDamageNotes('');
    setRepairCost(0);
    setMissingFee(0);
    setActualReturnDate(new Date().toISOString().slice(0, 16));
  };

  const handleSubmitIntake = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await api.post(`/rentals/${selectedOrder._id}/return-intake`, {
        damageSeverity,
        damageNotes,
        repairCostEstimate: Number(repairCost),
        missingAccessoriesFee: Number(missingFee),
        actualReturnTime: actualReturnDate,
      });

      const { settlement, lateFeeBreakdown } = res.data.data;
      alert(
        `Return completed for #${selectedOrder.orderNumber}!\n` +
        `• Late Fee: ₹${lateFeeBreakdown.lateFee} ${lateFeeBreakdown.gracePeriodApplied ? '(Grace period applied)' : ''}\n` +
        `• Damage Deductions: ₹${Number(repairCost) + Number(missingFee)}\n` +
        `• Net Refund Issued: ₹${settlement.refundedAmount}`
      );

      setSelectedOrder(null);
      fetchReturnsQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Return intake failed.');
    } finally {
      setProcessing(false);
    }
  };

  // Live deduction estimate in UI
  const calculateEstimatedRefund = () => {
    if (!selectedOrder) return 0;
    const initial = selectedOrder.totalDeposit || 0;
    const sched = new Date(selectedOrder.returnScheduledAt).getTime();
    const act = new Date(actualReturnDate).getTime();
    let estimatedLateFee = 0;

    if (act > sched) {
      const mins = Math.floor((act - sched) / (1000 * 60));
      if (mins > 30) {
        const hrs = Math.ceil(mins / 60);
        estimatedLateFee = hrs * 150; // default 1.5x of 100
      }
    }

    const deductions = estimatedLateFee + Number(repairCost || 0) + Number(missingFee || 0);
    return Math.max(initial - deductions, 0);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem' }}>Return Intake & Condition Inspection</h1>
        <p>Inspect returned physical assets, log damages, auto-calculate late fees with grace periods, and settle security deposits.</p>
      </div>

      {loading ? (
        <div className="card skeleton" style={{ height: 200 }}></div>
      ) : orders.length === 0 ? (
        <div className="card empty-state">
          <CheckCircle2 className="empty-icon" color="var(--success)" />
          <h3>No Pending Returns Outstanding</h3>
          <p>All active rentals have been returned and settled.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Scheduled Deadline</th>
                <th>Items Rented</th>
                <th>Held Deposit</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong>#{order.orderNumber}</strong>
                  </td>
                  <td>
                    <strong>{order.customerId?.name}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {order.customerId?.phone}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: order.status === 'overdue' ? 'var(--danger)' : 'var(--text-primary)' }}>
                      {new Date(order.returnScheduledAt).toLocaleString()}
                    </span>
                  </td>
                  <td>{order.items?.map((i) => i.productId?.title).join(', ')}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 700 }}>₹{order.totalDeposit}</td>
                  <td>
                    <span className={`badge ${order.status === 'overdue' ? 'badge-danger' : 'badge-info'}`}>
                      {order.status === 'overdue' ? 'Overdue Return' : 'Active Rental'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpenIntake(order)}
                      className="btn btn-primary btn-sm"
                      style={{ gap: '0.4rem' }}
                    >
                      <RotateCcw size={14} /> Intake & Settle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Return Intake Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3>Return Inspection & Deposit Settlement</h3>
                <p style={{ fontSize: '0.85rem' }}>Order #{selectedOrder.orderNumber} — {selectedOrder.customerId?.name}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitIntake}>
              <div className="form-group">
                <label className="form-label">Recorded Return Timestamp</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={actualReturnDate}
                  onChange={(e) => setActualReturnDate(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Scheduled: {new Date(selectedOrder.returnScheduledAt).toLocaleString()} (30 min grace period applies)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Physical Damage Severity</label>
                  <select
                    className="form-select"
                    value={damageSeverity}
                    onChange={(e) => setDamageSeverity(e.target.value)}
                  >
                    <option value="none">None (Passed Inspection)</option>
                    <option value="minor">Minor Scratches / Cosmetic</option>
                    <option value="moderate">Moderate Damage (Needs Part)</option>
                    <option value="severe">Severe (Inoperable)</option>
                    <option value="total_loss">Total Loss (Scrap)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Repair Cost (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={repairCost}
                    onChange={(e) => setRepairCost(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Missing Accessories Charge (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={missingFee}
                  onChange={(e) => setMissingFee(e.target.value)}
                  min="0"
                  placeholder="e.g. 500 for missing lens cap/cable"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inspection & Damage Notes</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  placeholder="Note specific scratches, missing accessories, or mechanical issues..."
                />
              </div>

              {/* Settlement Preview Card */}
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Initial Security Deposit:</span>
                  <strong>₹{selectedOrder.totalDeposit}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                  <span>Damages & Accessories Deductions:</span>
                  <strong>-₹{Number(repairCost || 0) + Number(missingFee || 0)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)', fontSize: '1rem', fontWeight: 800 }}>
                  <span>Est. Refund to Customer:</span>
                  <span style={{ color: 'var(--success)' }}>₹{calculateEstimatedRefund()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setSelectedOrder(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={processing} className="btn btn-primary">
                  {processing ? 'Settling & Updating Invoice...' : 'Finalize Intake & Issue Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturnsPage;
