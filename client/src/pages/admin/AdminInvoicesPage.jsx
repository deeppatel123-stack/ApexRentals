import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Download, FileText } from 'lucide-react';

export const AdminInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data.data.invoices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (id) => {
    window.open(`/api/v1/invoices/${id}/download`, '_blank');
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem' }}>Invoices & Billing Archive</h1>
        <p>Complete record of customer invoices, taxes, security deposits, and downloadable PDFs.</p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Order Ref</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Subtotal</th>
              <th>Deposit</th>
              <th>Total Paid</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td>
                  <strong>{inv.invoiceNumber}</strong>
                </td>
                <td>#{inv.orderId?.orderNumber}</td>
                <td>{inv.customerId?.name}</td>
                <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                <td>₹{inv.subtotal}</td>
                <td style={{ color: 'var(--success)' }}>₹{inv.depositAmount}</td>
                <td>
                  <strong>₹{inv.totalAmount}</strong>
                </td>
                <td>
                  <span className={`badge ${inv.paymentStatus === 'paid' ? 'badge-info' : 'badge-success'}`}>
                    {inv.paymentStatus}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleDownload(inv._id)} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                    <Download size={14} /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInvoicesPage;
