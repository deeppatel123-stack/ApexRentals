import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
  Check,
  Package,
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rental Schedule State (Default: starts tomorrow at 10 AM, ends in 3 days)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const threeDaysLater = new Date(tomorrow);
  threeDaysLater.setDate(tomorrow.getDate() + 3);

  const [startDate, setStartDate] = useState(tomorrow.toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(threeDaysLater.toISOString().slice(0, 16));

  // Live Pricing & Availability State
  const [pricingQuote, setPricingQuote] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  useEffect(() => {
    if (product && startDate && endDate) {
      calculateLiveQuote();
    }
  }, [product, selectedVariant, startDate, endDate]);

  const fetchProductDetails = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.data.product);
      setVariants(res.data.data.variants || []);
      if (res.data.data.variants?.length > 0) {
        setSelectedVariant(res.data.data.variants[0]);
      }
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateLiveQuote = async () => {
    setCheckingAvailability(true);
    try {
      const res = await api.post('/products/price-preview', {
        productId: product._id,
        variantId: selectedVariant?._id || null,
        startDate,
        endDate,
      });
      setPricingQuote(res.data.data);
    } catch (err) {
      console.error('Price calculation failed:', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleAddToCart = () => {
    if (!pricingQuote || !pricingQuote.isAvailable) return;

    addItem({
      productId: product._id,
      title: product.title,
      image: product.images?.[0],
      sku: product.sku,
      variantId: selectedVariant?._id || null,
      variantTitle: selectedVariant?.title || null,
      rentalStart: startDate,
      rentalEnd: endDate,
      durationDays: pricingQuote.totalDays,
      durationHours: pricingQuote.totalHours,
      rateApplied: pricingQuote.rateApplied,
      lineRentalFee: pricingQuote.lineRentalFee,
      lineDeposit: pricingQuote.lineDeposit,
      taxAmount: pricingQuote.taxAmount,
      totalLineAmount: pricingQuote.totalLineAmount,
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      navigate('/cart');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <div className="card skeleton" style={{ height: 450 }}></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h2>Product not found</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>
        {/* Left Column: Imagery & Details */}
        <div>
          <div
            style={{
              height: 380,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-tertiary)',
              marginBottom: '1.5rem',
            }}
          >
            <img
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'}
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>Equipment Specifications</h3>
            <p style={{ marginBottom: '1.25rem' }}>{product.description}</p>

            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Accessories Checklist:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {product.accessoriesChecklist?.map((acc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <Check size={14} color="var(--success)" />
                  <span>{acc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Date Selection, Rate Calculation & Booking Action */}
        <div>
          <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
            {product.category?.name}
          </span>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{product.title}</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Brand: {product.brand} | SKU: {product.sku}
          </p>

          {/* Variants Selector */}
          {variants.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Select Variant / Configuration</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {variants.map((v) => (
                  <button
                    key={v._id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`btn btn-sm ${selectedVariant?._id === v._id ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rental Scheduling Box */}
          <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary-border)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--primary)" /> Select Rental Schedule
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Rental Start Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rental Return Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Live Availability Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Fleet Availability:</span>
              {checkingAvailability ? (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Checking schedule...</span>
              ) : pricingQuote?.isAvailable ? (
                <span className="badge badge-success">
                  <CheckCircle size={12} /> In Stock ({pricingQuote.availableUnitsCount} Units Ready)
                </span>
              ) : (
                <span className="badge badge-danger">
                  <AlertTriangle size={12} /> Fully Booked For Selected Window
                </span>
              )}
            </div>
          </div>

          {/* Live Pricing Breakdown Card */}
          {pricingQuote && (
            <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Quote Breakdown</h4>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Rental Period ({pricingQuote.totalDays} days / {pricingQuote.totalHours} hrs):</span>
                <span style={{ fontWeight: 600 }}>₹{pricingQuote.lineRentalFee}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--success)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Shield size={14} /> Refundable Security Deposit:
                </span>
                <span style={{ fontWeight: 600 }}>₹{pricingQuote.lineDeposit}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>Estimated GST (18%):</span>
                <span>₹{pricingQuote.taxAmount}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                }}
              >
                <span>Total Due at Checkout:</span>
                <span style={{ color: 'var(--primary)' }}>₹{pricingQuote.totalLineAmount}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                *Security deposit is refunded immediately upon on-time return inspection without deductions.
              </p>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!pricingQuote?.isAvailable || checkingAvailability}
            className={`btn ${addedSuccess ? 'btn-success' : 'btn-primary'} btn-lg`}
            style={{ width: '100%', gap: '0.65rem' }}
          >
            {addedSuccess ? (
              <>
                <Check size={20} /> Added to Rental Cart!
              </>
            ) : (
              <>
                <ShoppingCart size={20} /> Add to Rental Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
