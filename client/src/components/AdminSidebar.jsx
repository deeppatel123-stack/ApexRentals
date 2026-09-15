import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Tag,
  FileText,
  CalendarCheck,
  Truck,
  RotateCcw,
  ShieldCheck,
  Receipt,
  Wrench,
  BrainCircuit,
  Settings,
} from 'lucide-react';

export const AdminSidebar = () => {
  const navItems = [
    { to: '/admin/dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products & Variants', icon: Package },
    { to: '/admin/inventory', label: 'Fleet Inventory', icon: Boxes },
    { to: '/admin/pricelists', label: 'Pricelists & Rules', icon: Tag },
    { to: '/admin/quotations', label: 'Quotations & Templates', icon: FileText },
    { to: '/admin/rentals', label: 'Rental Orders', icon: CalendarCheck },
    { to: '/admin/pickups', label: 'Pickups & Dispatches', icon: Truck },
    { to: '/admin/returns', label: 'Returns & Inspections', icon: RotateCcw },
    { to: '/admin/deposits', label: 'Security Deposits', icon: ShieldCheck },
    { to: '/admin/invoices', label: 'Invoices & Billing', icon: Receipt },
    { to: '/admin/maintenance', label: 'Maintenance Orders', icon: Wrench },
    { to: '/admin/ai-insights', label: 'AI Predictive Suite', icon: BrainCircuit },
    { to: '/admin/settings', label: 'Organization Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
        minHeight: 'calc(100vh - var(--header-height))',
        padding: '1.25rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
      }}
    >
      <div style={{ padding: '0 0.75rem 0.75rem 0.75rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          Management Operations
        </p>
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
            })}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};

export default AdminSidebar;
