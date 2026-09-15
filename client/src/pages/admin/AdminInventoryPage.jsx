import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Boxes, Plus, X, Tag, Wrench, Shield, CheckCircle } from 'lucide-react';

export const AdminInventoryPage = () => {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New Item State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [barcode, setBarcode] = useState('');
  const [condition, setCondition] = useState('excellent');

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, [statusFilter]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.data.products);
      if (res.data.data.products.length > 0) {
        setSelectedProductId(res.data.data.products[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInventory = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/inventory', { params });
      setItems(res.data.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory', {
        productId: selectedProductId,
        serialNumber,
        barcode: barcode || `BC-${serialNumber}`,
        currentCondition: condition,
      });

      setShowModal(false);
      setSerialNumber('');
      setBarcode('');
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add inventory unit.');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/inventory/${id}`, { status: newStatus });
      fetchInventory();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="badge badge-success">Available</span>;
      case 'rented':
        return <span className="badge badge-info">Rented Out</span>;
      case 'maintenance':
        return <span className="badge badge-danger">In Workshop / Repair</span>;
      case 'reserved':
        return <span className="badge badge-warning">Reserved</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Fleet Inventory (Serialized Assets)</h1>
          <p>Track individual physical asset serial numbers, wear hours, and workshop maintenance status.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Register Serialized Asset
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['', 'available', 'rented', 'maintenance'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {st === '' ? 'All Fleet Units' : st}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Equipment Model</th>
              <th>Serial Number</th>
              <th>Barcode</th>
              <th>Current Status</th>
              <th>Condition</th>
              <th>Wear Runtime</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.productId?.title}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    SKU: {item.productId?.sku}
                  </span>
                </td>
                <td>
                  <code style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.serialNumber}</code>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.barcode || '—'}</span>
                </td>
                <td>{getStatusBadge(item.status)}</td>
                <td>
                  <span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{item.currentCondition}</span>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.cumulativeRentalHours || 0} hrs</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ({item.totalRentalsCount || 0} rentals)
                  </span>
                </td>
                <td>
                  <select
                    className="form-select"
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', width: 'auto' }}
                    value={item.status}
                    onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                  >
                    <option value="available">Set Available</option>
                    <option value="maintenance">Send to Maintenance</option>
                    <option value="retired">Retire Unit</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Unit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3>Register New Physical Asset</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUnit}>
              <div className="form-group">
                <label className="form-label">Select Equipment Model</label>
                <select className="form-select" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Physical Serial Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. SN-FX3-99201"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Barcode Tag (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. BC-FX3-99201"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Initial Physical Condition</label>
                <select className="form-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
                  <option value="excellent">Excellent (Factory Mint)</option>
                  <option value="good">Good (Minor Wear)</option>
                  <option value="fair">Fair</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;
