import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Calendar,
  Clock,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Package,
  ArrowRight,
} from 'lucide-react';

export const MyRentalsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/rentals/my-orders');
      setOrders(res.data.data.orders);
    } catch (err) {
      console.error('Failed to load rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-info">Active Ongoing</span>;
      case 'overdue':
        return <span className="badge badge-danger">Overdue Penalty</span>;
      case 'confirmed':
        return <span className="badge badge-warning">Ready for Pickup</span>;
      case 'closed':
        return <span className="badge badge-success">Completed & Settled</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'active') return order.status === 'active';
    if (activeTab === 'overdue') return order.status === 'overdue';
    if (activeTab === 'closed') return order.status === 'closed';
    return true;
  });

  return (
    <div className="container">
      <h1 style={{ marginBottom: '0.5rem' }}>My Rental Bookings</h1>
      <p style={{ marginBottom: '2rem' }}>Track ongoing gear, view return deadlines, and download invoices.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {['all', 'active', 'overdue', 'closed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {tab === 'closed' ? 'Completed' : tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card skeleton" style={{ height: 140 }}></div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card empty-state">
          <Package className="empty-icon" />
          <h3>No Orders Found</h3>
          <p>You have no rental orders matching the selected filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                borderLeft:
                  order.status === 'overdue'
                    ? '4px solid var(--danger)'
                    : order.status === 'active'
                    ? '4px solid var(--info)'
                    : '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem' }}>#{order.orderNumber}</h3>
                  {getStatusBadge(order.status)}
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Booked on {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Items Summary */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={item.productId?.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100'}
                      alt=""
                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.9rem', display: 'block' }}>{item.productId?.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Return by: {new Date(order.returnScheduledAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                  <span>Total Paid: <strong>₹{order.totalPaid}</strong></span>
                  <span style={{ color: 'var(--success)' }}>Deposit Held: <strong>₹{order.totalDeposit}</strong></span>
                  {order.lateFeeAccrued > 0 && (
                    <span style={{ color: 'var(--danger)' }}>Late Fee: <strong>+₹{order.lateFeeAccrued}</strong></span>
                  )}
                  {order.netRefundAmount > 0 && (
                    <span style={{ color: 'var(--success)' }}>Refunded: <strong>₹{order.netRefundAmount}</strong></span>
                  )}
                </div>

                <Link to={`/rentals/${order._id}`} className="btn btn-secondary btn-sm">
                  View Full Details & Settlement <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRentalsPage;
