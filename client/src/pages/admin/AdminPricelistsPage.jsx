import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Tag, Plus, CheckCircle, X } from 'lucide-react';

export const AdminPricelistsPage = () => {
  const [pricelists, setPricelists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [customerTier, setCustomerTier] = useState('all');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    fetchPricelists();
  }, []);

  const fetchPricelists = async () => {
    try {
      const res = await api.get('/pricelists');
      setPricelists(res.data.data.pricelists);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pricelists', {
        name,
        customerTier,
        description,
        isDefault,
      });
      setShowModal(false);
      setName('');
      setDescription('');
      fetchPricelists();
    } catch (err) {
      alert('Failed to create pricelist.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Dynamic Pricelists & Rules</h1>
          <p>Configure seasonal rates, customer-tier discounts (VIP, Corporate), and fallback standard rules.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Create Pricelist
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {pricelists.map((list) => (
          <div key={list._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>{list.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tier Target: {list.customerTier.toUpperCase()}</span>
              </div>
              {list.isDefault && <span className="badge badge-success">Default System Pricelist</span>}
            </div>

            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>{list.description || 'Applies to all standard customer bookings.'}</p>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Rules configured: {list.rules?.length || 0} product overrides
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3>Create Dynamic Pricelist</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Pricelist Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Festival Season 10% Off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Customer Tier</label>
                <select className="form-select" value={customerTier} onChange={(e) => setCustomerTier(e.target.value)}>
                  <option value="all">All Customer Tiers</option>
                  <option value="standard">Standard Customers</option>
                  <option value="vip">VIP Partners Only</option>
                  <option value="corporate">Corporate Accounts</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Scope</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Pricelist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricelistsPage;
