import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Truck, CheckCircle2, QrCode, ArrowRight, ShieldCheck, X } from 'lucide-react';

export const AdminPickupsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dispatching, setDispatching] = useState(false);

  // Pre-rental Checklist
  const [checklist, setChecklist] = useState({
    hardwareIntact: true,
    accessoriesComplete: true,
    batteriesCharged: true,
    customerIdentityVerified: true,
  });

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      const res = await api.get('/rentals/admin/all?status=confirmed');
      setOrders(res.data.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchOrder = async (e) => {
    e.preventDefault();
    setDispatching(true);

    try {
      const checklistResults = [
        { item: 'Hardware visual integrity check', passed: checklist.hardwareIntact },
        { item: 'All accessories and cables verified', passed: checklist.accessoriesComplete },
        { item: 'Power & batteries fully operational', passed: checklist.batteriesCharged },
        { item: 'Customer photo identification verified', passed: checklist.customerIdentityVerified },
      ];

      await api.put(`/rentals/${selectedOrder._id}/dispatch`, {
        checklistResults,
      });

      alert(`Order #${selectedOrder.orderNumber} successfully marked dispatched and active!`);
      setSelectedOrder(null);
      fetchPickups();
    } catch (err) {
      alert(err.response?.data?.message || 'Dispatch failed.');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem' }}>Pickups & Dispatch Operations</h1>
        <p>Complete pre-rental inspection checklists and verify customer QR codes before handing over physical fleet assets.</p>
      </div>

      {loading ? (
        <div className="card skeleton" style={{ height: 200 }}></div>
      ) : orders.length === 0 ? (
        <div className="card empty-state">
          <Truck className="empty-icon" />
          <h3>All Scheduled Dispatches Complete</h3>
          <p>There are no pending confirmed orders waiting for customer handover or delivery dispatch right now.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Fulfillment</th>
                <th>Scheduled Pickup</th>
                <th>Items to Handover</th>
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
                    <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                      {order.fulfillmentType.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{new Date(order.pickupScheduledAt).toLocaleString()}</td>
                  <td>
                    {order.items?.map((i) => i.productId?.title).join(', ')}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn btn-primary btn-sm"
                    >
                      <CheckCircle2 size={14} /> Process Handover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dispatch Checklist Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3>Pre-Rental Handover Inspection</h3>
                <p style={{ fontSize: '0.85rem' }}>Order #{selectedOrder.orderNumber} — {selectedOrder.customerId?.name}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDispatchOrder}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Physical Verification Checklist</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={checklist.hardwareIntact}
                      onChange={(e) => setChecklist({ ...checklist, hardwareIntact: e.target.checked })}
                    />
                    <span>Equipment hardware, lenses, and enclosures free of damage</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={checklist.accessoriesComplete}
                      onChange={(e) => setChecklist({ ...checklist, accessoriesComplete: e.target.checked })}
                    />
                    <span>All listed accessories, cables, adapters, and cases verified present</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={checklist.batteriesCharged}
                      onChange={(e) => setChecklist({ ...checklist, batteriesCharged: e.target.checked })}
                    />
                    <span>Batteries tested and power verified</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={checklist.customerIdentityVerified}
                      onChange={(e) => setChecklist({ ...checklist, customerIdentityVerified: e.target.checked })}
                    />
                    <span>Customer identity or QR code scanned & verified</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setSelectedOrder(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatching || !checklist.hardwareIntact || !checklist.accessoriesComplete}
                  className="btn btn-primary"
                >
                  {dispatching ? 'Processing Handover...' : 'Confirm Dispatch (Set Active)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPickupsPage;
