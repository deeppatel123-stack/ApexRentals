import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  Lock,
} from 'lucide-react';

export const CheckoutPage = () => {
  const { items, grandTotal, totalRentalFee, totalDeposit, totalTax, fulfillmentType, deliveryAddress, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('card_demo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  if (items.length === 0 && !confirmedOrder) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          rentalStart: i.rentalStart,
          rentalEnd: i.rentalEnd,
        })),
        fulfillmentType,
        deliveryAddress:
          fulfillmentType === 'doorstep_delivery'
            ? deliveryAddress || { street: 'Main Road', city: 'Mumbai', state: 'MH', postalCode: '400050' }
            : undefined,
        paymentMethod,
      };

      const res = await api.post('/rentals/checkout', payload);
      setConfirmedOrder(res.data.data.order);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please review your cart.');
    } finally {
      setLoading(false);
    }
  };

  // Order Confirmation View
  if (confirmedOrder) {
    return (
      <div className="container" style={{ maxWidth: 600, padding: '3rem 1rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Rental Order Confirmed!</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Thank you for your booking. Order reference:{' '}
            <strong style={{ color: 'var(--primary)' }}>#{confirmedOrder.orderNumber}</strong>
          </p>

          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '2rem',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Fulfillment:</span>
              <strong style={{ textTransform: 'capitalize' }}>
                {confirmedOrder.fulfillmentType.replace('_', ' ')}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Total Amount Paid:</span>
              <strong>₹{confirmedOrder.totalPaid}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--success)' }}>
              <span>Security Deposit Held:</span>
              <strong>₹{confirmedOrder.totalDeposit}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Scheduled Return:</span>
              <strong>{new Date(confirmedOrder.returnScheduledAt).toLocaleString()}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to={`/rentals/${confirmedOrder._id}`} className="btn btn-primary">
              View Order & Invoice <ArrowRight size={16} />
            </Link>
            <Link to="/my-rentals" className="btn btn-secondary">
              Go to My Rentals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 880 }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Checkout & Payment</h1>
      <p style={{ marginBottom: '2rem' }}>Complete your secure rental payment and refundable security deposit.</p>

      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--danger-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
          }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left: Payment Method Simulator */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} color="var(--primary)" /> Secure Payment Simulator
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'card_demo' ? 'var(--primary-light)' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card_demo"
                  checked={paymentMethod === 'card_demo'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <CreditCard size={18} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    Credit / Debit Card (Demo)
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulated instant authorization</p>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'upi_demo' ? 'var(--primary-light)' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi_demo"
                  checked={paymentMethod === 'upi_demo'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <ShieldCheck size={18} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    UPI / QR Transfer (Demo)
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GPay / PhonePe / Paytm test mode</p>
                </div>
              </label>
            </div>

            {/* Test Card Fields */}
            {paymentMethod === 'card_demo' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Simulated Card Number</label>
                  <input type="text" className="form-input" value="4242 •••• •••• 4242" readOnly />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry</label>
                    <input type="text" className="form-input" value="12/28" readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input type="text" className="form-input" value="888" readOnly />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              {loading ? 'Authorizing & Booking...' : `Pay ₹${grandTotal} & Confirm Booking`}
            </button>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="card" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Order Item Breakdown</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div>
                    <strong style={{ display: 'block' }}>{item.title}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {item.durationDays} Days ({new Date(item.rentalStart).toLocaleDateString()} - {new Date(item.rentalEnd).toLocaleDateString()})
                    </span>
                  </div>
                  <span style={{ fontWeight: 600 }}>₹{item.lineRentalFee}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Rental Subtotal:</span>
                <span>₹{totalRentalFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                <span>Security Deposit (Refundable):</span>
                <span>₹{totalDeposit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Tax (GST 18%):</span>
                <span>₹{totalTax}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <span>Total Charge:</span>
                <span style={{ color: 'var(--primary)' }}>₹{grandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
