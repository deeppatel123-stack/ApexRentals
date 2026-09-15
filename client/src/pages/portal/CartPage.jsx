import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  Trash2,
  Calendar,
  Clock,
  Shield,
  Truck,
  Store,
  ArrowRight,
  Package,
} from 'lucide-react';

export const CartPage = () => {
  const {
    items,
    removeItem,
    clearCart,
    totalRentalFee,
    totalDeposit,
    totalTax,
    grandTotal,
    fulfillmentType,
    setFulfillmentType,
    deliveryAddress,
    setDeliveryAddress,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="card empty-state" style={{ maxWidth: 500, margin: '0 auto' }}>
          <Package className="empty-icon" />
          <h2>Your Rental Cart is Empty</h2>
          <p>Explore our catalog of professional cameras, AV gear, and industrial equipment.</p>
          <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Browse Rental Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '0.5rem' }}>Rental Cart & Scheduling</h1>
      <p style={{ marginBottom: '2rem' }}>Review reserved rental windows, rates, and fulfillment options.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left: Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item, index) => (
            <div
              key={index}
              className="card"
              style={{
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'center',
                padding: '1.25rem',
              }}
            >
              <img
                src={item.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200'}
                alt={item.title}
                style={{
                  width: 90,
                  height: 90,
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{item.title}</h3>
                  <button
                    onClick={() => removeItem(index)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {item.variantTitle && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Variant: {item.variantTitle}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={13} /> {new Date(item.rentalStart).toLocaleDateString()} — {new Date(item.rentalEnd).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> {item.durationDays} Days ({item.durationHours} hrs)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                  <span>Rental: <strong>₹{item.lineRentalFee}</strong></span>
                  <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Shield size={13} /> Deposit: <strong>₹{item.lineDeposit}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="btn btn-secondary btn-sm"
            style={{ alignSelf: 'flex-start' }}
          >
            Clear All Items
          </button>
        </div>

        {/* Right: Fulfillment & Financial Summary */}
        <div>
          {/* Fulfillment Method Selection */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Fulfillment Method</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => setFulfillmentType('store_pickup')}
                className={`btn ${fulfillmentType === 'store_pickup' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexDirection: 'column', padding: '1rem', gap: '0.5rem' }}
              >
                <Store size={22} />
                <span>Store Pickup</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Free verification</span>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('doorstep_delivery')}
                className={`btn ${fulfillmentType === 'doorstep_delivery' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexDirection: 'column', padding: '1rem', gap: '0.5rem' }}
              >
                <Truck size={22} />
                <span>Doorstep Delivery</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Direct dispatch</span>
              </button>
            </div>

            {fulfillmentType === 'doorstep_delivery' && (
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Delivery Address</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Enter street, building, city, and postal code..."
                  value={deliveryAddress?.street || ''}
                  onChange={(e) =>
                    setDeliveryAddress({
                      street: e.target.value,
                      city: 'Mumbai',
                      state: 'Maharashtra',
                      postalCode: '400050',
                    })
                  }
                  required
                />
              </div>
            )}
          </div>

          {/* Pricing Ledger */}
          <div className="card" style={{ border: '1px solid var(--primary-border)' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Payment Summary</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
              <span>Total Rental Subtotal:</span>
              <span style={{ fontWeight: 600 }}>₹{totalRentalFee}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--success)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Shield size={14} /> Refundable Security Deposit:
              </span>
              <span style={{ fontWeight: 600 }}>₹{totalDeposit}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Estimated GST (18%):</span>
              <span>₹{totalTax}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                fontSize: '1.25rem',
                fontWeight: 800,
                marginBottom: '1.5rem',
              }}
            >
              <span>Grand Total Payable:</span>
              <span style={{ color: 'var(--primary)' }}>₹{grandTotal}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', gap: '0.5rem' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
