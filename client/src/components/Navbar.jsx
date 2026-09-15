import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import {
  Layers,
  ShoppingCart,
  Sun,
  Moon,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Package,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, theme, toggleTheme, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api
        .get('/notifications')
        .then((res) => setUnreadCount(res.data.data.unreadCount || 0))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            color: 'var(--text-primary)',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Layers size={20} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
            APEX<span style={{ color: 'var(--primary)', fontWeight: 600 }}>RENTALS</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link
            to="/catalog"
            style={{
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Package size={16} /> Catalog
          </Link>

          {user && !isAdmin && (
            <Link
              to="/my-rentals"
              style={{
                textDecoration: 'none',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              My Rentals
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              style={{
                textDecoration: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <LayoutDashboard size={16} /> Admin Console
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
            }}
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Cart Icon */}
          {!isAdmin && (
            <Link
              to="/cart"
              style={{
                position: 'relative',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                padding: '0.4rem',
                display: 'flex',
              }}
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {/* User Section */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {user.name.split(' ')[0]} {isAdmin && <span className="badge badge-info">Admin</span>}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Logout"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
