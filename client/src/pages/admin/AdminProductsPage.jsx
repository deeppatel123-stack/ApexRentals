import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Package, Plus, Search, Trash2, Edit2, X, Check } from 'lucide-react';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New Product Form State
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [dailyRate, setDailyRate] = useState(1000);
  const [hourlyRate, setHourlyRate] = useState(150);
  const [depositValue, setDepositValue] = useState(3000);
  const [depositType, setDepositType] = useState('fixed');
  const [checklist, setChecklist] = useState('Power Cable, Battery, Case');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data.categories);
      if (res.data.data.categories?.length > 0) {
        setCategory(res.data.data.categories[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?activeOnly=false');
      setProducts(res.data.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        title,
        brand,
        sku,
        category,
        description,
        baseRates: {
          hourly: Number(hourlyRate),
          daily: Number(dailyRate),
        },
        depositRule: {
          type: depositType,
          value: Number(depositValue),
        },
        accessoriesChecklist: checklist.split(',').map((s) => s.trim()),
      });

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create product.');
    }
  };

  const handleDeactivate = async (id) => {
    if (confirm('Are you sure you want to deactivate this product?')) {
      await api.delete(`/products/${id}`);
      fetchProducts();
    }
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Products & Attributes</h1>
          <p>Configure equipment catalog, base rental rates, and security deposit rules.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Add New Equipment
        </button>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '1.5rem', maxWidth: 400 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Filter by product name, SKU, brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Category</th>
              <th>SKU</th>
              <th>Daily Rate</th>
              <th>Deposit Rule</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((prod) => (
              <tr key={prod._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=80'}
                      alt=""
                      style={{ width: 42, height: 42, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ display: 'block' }}>{prod.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.brand}</span>
                    </div>
                  </div>
                </td>
                <td>{prod.category?.name || 'General'}</td>
                <td>
                  <code style={{ fontSize: '0.8rem' }}>{prod.sku}</code>
                </td>
                <td>₹{prod.baseRates?.daily} / day</td>
                <td>
                  {prod.depositRule?.type === 'fixed'
                    ? `Fixed ₹${prod.depositRule?.value}`
                    : `${prod.depositRule?.value}% of rental`}
                </td>
                <td>
                  <span className={`badge ${prod.isActive ? 'badge-success' : 'badge-neutral'}`}>
                    {prod.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleDeactivate(prod._id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}
                    title="Deactivate product"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Product Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3>Add New Rental Equipment</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label className="form-label">Equipment Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Canon Cinema EOS C70 Camera"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Canon"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CAM-CAN-C70"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Daily Rental Rate (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hourly Rental Rate (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Deposit Type</label>
                  <select className="form-select" value={depositType} onChange={(e) => setDepositType(e.target.value)}>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="percentage">Percentage (%) of Rental</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Deposit Value</label>
                  <input
                    type="number"
                    className="form-input"
                    value={depositValue}
                    onChange={(e) => setDepositValue(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Accessories Checklist (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={checklist}
                  onChange={(e) => setChecklist(e.target.value)}
                  placeholder="Battery, Charger, Top Handle, Case"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed specifications and usage guidelines..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Equipment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
