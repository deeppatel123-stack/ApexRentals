import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Save, CheckCircle } from 'lucide-react';

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    currency: '₹',
    taxPercentage: 18,
    defaultGracePeriodMinutes: 30,
    lateFeeHourlyMultiplier: 1.5,
    lateFeeDailyRate: 500,
    quotationHeader: '',
    quotationFooter: '',
  });

  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.data.settings) {
        setSettings(res.data.data.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert('Failed to save settings.');
    }
  };

  if (loading) {
    return <div className="card skeleton" style={{ height: 300 }}></div>;
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem' }}>Organization & Rental Policies</h1>
        <p>Configure company branding, invoice templates, tax rates, and late fee calculation rules.</p>
      </div>

      {savedSuccess && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--success-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <CheckCircle size={18} /> Settings successfully updated and applied across all business modules!
        </div>
      )}

      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Company Identity */}
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Company Identity & Contact</h3>
          <div className="form-group">
            <label className="form-label">Company Legal Name</label>
            <input
              type="text"
              className="form-input"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Support Email</label>
              <input
                type="email"
                className="form-input"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Support Phone</label>
              <input
                type="text"
                className="form-input"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Headquarters Physical Address</label>
            <input
              type="text"
              className="form-input"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Business & Penalty Rules */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Rental Calculations & Penalty Policy</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <input
                type="text"
                className="form-input"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">GST / Tax Percentage (%)</label>
              <input
                type="number"
                className="form-input"
                value={settings.taxPercentage}
                onChange={(e) => setSettings({ ...settings, taxPercentage: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Grace Period (Minutes)</label>
              <input
                type="number"
                className="form-input"
                value={settings.defaultGracePeriodMinutes}
                onChange={(e) => setSettings({ ...settings, defaultGracePeriodMinutes: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Hourly Late Fee Multiplier</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={settings.lateFeeHourlyMultiplier}
                onChange={(e) => setSettings({ ...settings, lateFeeHourlyMultiplier: Number(e.target.value) })}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                e.g., 1.5x regular hourly rental rate
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Daily Late Fallback Fee (₹)</label>
              <input
                type="number"
                className="form-input"
                value={settings.lateFeeDailyRate}
                onChange={(e) => setSettings({ ...settings, lateFeeDailyRate: Number(e.target.value) })}
                required
              />
            </div>
          </div>
        </div>

        {/* Quotations & Invoicing Templates */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Quotation & Invoicing Header / Footer</h3>

          <div className="form-group">
            <label className="form-label">Quotation Header Banner</label>
            <input
              type="text"
              className="form-input"
              value={settings.quotationHeader}
              onChange={(e) => setSettings({ ...settings, quotationHeader: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quotation Footer & Terms</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={settings.quotationFooter}
              onChange={(e) => setSettings({ ...settings, quotationFooter: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-start', gap: '0.5rem' }}>
          <Save size={18} /> Save Organization Settings
        </button>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
