import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Plus, CheckCircle, ArrowRight, X, Clock } from 'lucide-react';

export const AdminQuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Quote Form
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [days, setDays] = useState(3);
  const [validDays, setValidDays] = useState(7);

  useEffect(() => {
    fetchQuotations();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchQuotations = async () => {
    try {
      const res = await api.get('/quotations');
      setQuotations(res.data.data.quotations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/users/admin/customers');
      setCustomers(res.data.data.customers);
      if (res.data.data.customers?.length > 0) {
        setCustomerId(res.data.data.customers[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.data.products);
      if (res.data.data.products?.length > 0) {
        setProductId(res.data.data.products[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    const start = new Date();
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + Number(days));

    try {
      await api.post('/quotations', {
        customerId,
        items: [
          {
            productId,
            rentalStart: start.toISOString(),
            rentalEnd: end.toISOString(),
          },
        ],
        validDays: Number(validDays),
      });

      setShowModal(false);
      fetchQuotations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create quotation.');
    }
  };

  const handleConvertToOrder = async (quoteId) => {
    if (confirm('Convert this Quotation into a confirmed walk-in Rental Order and generate invoice?')) {
      try {
        const res = await api.post(`/quotations/${quoteId}/convert-to-order`);
        alert('Quotation successfully converted to Order #' + res.data.data.order.orderNumber);
        fetchQuotations();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to convert quotation.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Quotations & In-Store Estimates</h1>
          <p>Create quick rental quotes for walk-in clients and convert them to confirmed orders in 1 click.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Create Quick Quotation
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Quotation #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Rental Fee</th>
              <th>Deposit</th>
              <th>Total Estimate</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quote) => (
              <tr key={quote._id}>
                <td>
                  <strong>{quote.quotationNumber}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Expires: {new Date(quote.validUntil).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <strong>{quote.customerId?.name}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {quote.customerId?.email}
                  </span>
                </td>
                <td>{quote.items?.length || 0} item(s)</td>
                <td>₹{quote.subtotal}</td>
                <td style={{ color: 'var(--success)' }}>₹{quote.depositTotal}</td>
                <td>
                  <strong>₹{quote.totalAmount}</strong>
                </td>
                <td>
                  <span
                    className={`badge ${
                      quote.status === 'converted'
                        ? 'badge-success'
                        : quote.status === 'draft'
                        ? 'badge-info'
                        : 'badge-warning'
                    }`}
                  >
                    {quote.status}
                  </span>
                </td>
                <td>
                  {quote.status !== 'converted' ? (
                    <button
                      onClick={() => handleConvertToOrder(quote._id)}
                      className="btn btn-success btn-sm"
                    >
                      <CheckCircle size={14} /> Convert to Order
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Converted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3>Create Fast Quotation</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation}>
              <div className="form-group">
                <label className="form-label">Customer Account</label>
                <select className="form-select" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.email}) - {c.tier?.toUpperCase()} Tier
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Rental Equipment</label>
                <select className="form-select" value={productId} onChange={(e) => setProductId(e.target.value)}>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} (₹{p.baseRates?.daily}/day)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Rental Duration (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Validity Window (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={validDays}
                    onChange={(e) => setValidDays(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Generate Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuotationsPage;
