import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, Search, ArrowRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const AdminRentalsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get('/rentals/admin/all', { params });
      setOrders(res.data.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-info">Active</span>;
      case 'overdue':
        return <span className="badge badge-danger">Overdue</span>;
      case 'confirmed':
        return <span className="badge badge-warning">Ready for Pickup</span>;
      case 'closed':
        return <span className="badge badge-success">Closed / Returned</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Rental Orders Management</h1>
          <p>Monitor all client bookings, fulfillment tracking, and operational statuses.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['', 'confirmed', 'active', 'overdue', 'closed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {st === '' ? 'All Orders' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order Reference</th>
              <th>Customer</th>
              <th>Fulfillment</th>
              <th>Rental Period</th>
              <th>Fee + Deposit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>
                  <strong>#{order.orderNumber}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {order.items?.length || 0} item(s)
                  </span>
                </td>
                <td>
                  <strong>{order.customerId?.name}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {order.customerId?.phone || order.customerId?.email}
                  </span>
                </td>
                <td>
                  <span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>
                    {order.fulfillmentType.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', display: 'block' }}>
                    Out: {new Date(order.pickupScheduledAt).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: order.status === 'overdue' ? 'var(--danger)' : 'var(--text-muted)' }}>
                    Due: {new Date(order.returnScheduledAt).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <strong>₹{order.totalRentalFee}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--success)' }}>
                    Dep: ₹{order.totalDeposit}
                  </span>
                </td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  <Link to={`/rentals/${order._id}`} className="btn btn-secondary btn-sm">
                    View Details <ArrowRight size={14} />
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

export default AdminRentalsPage;
