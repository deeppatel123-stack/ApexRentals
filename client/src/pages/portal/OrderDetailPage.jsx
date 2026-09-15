import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ShieldCheck,
  Calendar,
  Clock,
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
  QrCode,
  ArrowLeft,
} from 'lucide-react';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const res = await api.get(`/rentals/${id}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (data?.invoice?._id) {
      window.open(`/api/v1/invoices/${data.invoice._id}/download`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <div className="card skeleton" style={{ height: 400 }}></div>
      </div>
    );
  }

  if (!data || !data.order) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <Link to="/my-rentals" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to My Rentals
        </Link>
      </div>
    );
  }

  const { order, deposit, invoice, inspections } = data;
  const isOverdue = order.status === 'overdue';

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      {/* Back Link & Header */}
      <Link to="/my-rentals" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Back to My Rentals
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Order #{order.orderNumber}</h1>
          <p>Booked on {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <button onClick={handleDownloadInvoice} className="btn btn-primary btn-sm" style={{ gap: '0.5rem' }}>
          <Download size={16} /> Download Official PDF Invoice
        </button>
      </div>

      {/* Overdue Warning Banner */}
      {isOverdue && (
        <div
          style={{
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={24} />
          <div>
            <strong style={{ display: 'block' }}>Rental Return is Overdue!</strong>
            <span style={{ fontSize: '0.85rem' }}>
              The scheduled deadline was {new Date(order.returnScheduledAt).toLocaleString()}. Accrued late penalty:{' '}
              <strong>₹{order.lateFeeAccrued}</strong>. Return to the store immediately to avoid further deductions.
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Items & Verification */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left: Items & Serial Info */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Rented Equipment</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <img
                  src={item.productId?.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=120'}
                  alt=""
                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.95rem' }}>{item.productId?.title}</strong>
                  {item.inventoryItemId && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Serial Number: <strong>{item.inventoryItemId?.serialNumber}</strong>
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                    <span>Rate: ₹{item.rateApplied}</span>
                    <span>Fee: ₹{item.lineRentalFee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Fulfillment:</span>
              <strong style={{ textTransform: 'capitalize' }}>{order.fulfillmentType.replace('_', ' ')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Scheduled Pickup:</span>
              <span>{new Date(order.pickupScheduledAt).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Scheduled Return:</span>
              <span>{new Date(order.returnScheduledAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Verification QR & Inspection Status */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>Digital Pickup / Return Pass</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Present this QR code to the rental manager at the desk for dispatch or return scanning.
          </p>

          {order.qrCodeString ? (
            <img
              src={order.qrCodeString}
              alt="Verification QR Code"
              style={{ width: 170, height: 170, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}
            />
          ) : (
            <div style={{ width: 170, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <QrCode size={48} color="var(--text-muted)" />
            </div>
          )}

          <div className="badge badge-info" style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
            Order Status: {order.status.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Security Deposit & Settlement Ledger */}
      {deposit && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--success)" /> Security Deposit Settlement Ledger
            </h3>
            <span
              className={`badge ${
                deposit.heldStatus === 'fully_refunded'
                  ? 'badge-success'
                  : deposit.heldStatus === 'partially_refunded'
                  ? 'badge-warning'
                  : deposit.heldStatus === 'held'
                  ? 'badge-info'
                  : 'badge-danger'
              }`}
            >
              Status: {deposit.heldStatus.replace('_', ' ')}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Initial Deposit Held:</span>
              <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹{deposit.initialAmount}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Deductions:</span>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: deposit.totalDeductions > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                -₹{deposit.totalDeductions}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net Refunded Amount:</span>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>
                ₹{deposit.refundedAmount}
              </p>
            </div>
          </div>

          {/* Deductions Itemized */}
          {deposit.deductions?.length > 0 ? (
            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Deductions Itemization:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {deposit.deductions.map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span>{d.notes || d.reason}</span>
                    <strong style={{ color: 'var(--danger)' }}>-₹{d.amount}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No condition or late fee deductions applied.
            </p>
          )}
        </div>
      )}

      {/* Condition Inspections History */}
      {inspections && inspections.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Physical Inspection Reports</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {inspections.map((insp) => (
              <div key={insp._id} style={{ padding: '0.85rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <strong style={{ textTransform: 'capitalize' }}>{insp.type} Inspection</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(insp.inspectedAt).toLocaleString()} by {insp.inspectorId?.name || 'Staff'}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem' }}>
                  Damage Severity: <strong>{insp.damageSeverity}</strong> {insp.damageNotes && `— ${insp.damageNotes}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
