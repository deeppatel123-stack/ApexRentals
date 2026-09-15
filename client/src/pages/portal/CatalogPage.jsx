import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Search, Filter, Package, ArrowRight, Shield } from 'lucide-react';

export const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.search = search;
      const res = await api.get('/products', { params });
      setProducts(res.data.data.products);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="container">
      {/* Header & Controls */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Rental Equipment Fleet</h1>
        <p>Select from professional gear with real-time availability and transparent deposit terms.</p>

        {/* Search & Category Filter Bar */}
        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            style={{ display: 'flex', gap: '0.75rem', maxWidth: 600 }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search by title, brand, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setSelectedCategory('')}
              className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`btn btn-sm ${selectedCategory === cat._id ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card skeleton" style={{ height: 360 }}></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card empty-state">
          <Package className="empty-icon" />
          <h3>No Equipment Found</h3>
          <p>Try clearing your search query or selecting another category.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {products.map((product) => (
            <div
              key={product._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem',
              }}
            >
              <div>
                {/* Product Image */}
                <div
                  style={{
                    height: 180,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-tertiary)',
                    marginBottom: '1rem',
                  }}
                >
                  <img
                    src={
                      product.images?.[0] ||
                      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600'
                    }
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span className="badge badge-info">{product.category?.name || 'General'}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {product.brand}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  {product.title}
                </h3>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{product.baseRates?.daily || 0}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / day</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Shield size={12} color="var(--success)" />
                    <span>Deposit: ₹{product.depositRule?.value || 1000}</span>
                  </div>
                </div>

                <Link
                  to={`/product/${product._id}`}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Check Availability & Rent <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
