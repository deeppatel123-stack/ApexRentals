import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BrainCircuit,
  AlertTriangle,
  TrendingUp,
  Wrench,
  Truck,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const AdminAIInsightsPage = () => {
  const [activeTab, setActiveTab] = useState('late-risk');
  const [loading, setLoading] = useState(false);

  const [riskData, setRiskData] = useState([]);
  const [demandData, setDemandData] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [businessInsights, setBusinessInsights] = useState(null);

  useEffect(() => {
    fetchActiveAIData(activeTab);
  }, [activeTab]);

  const fetchActiveAIData = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'late-risk' && riskData.length === 0) {
        const res = await api.get('/ai/late-return-risk');
        setRiskData(res.data.data.predictions || []);
      } else if (tab === 'demand' && !demandData) {
        const res = await api.get('/ai/demand-forecast');
        setDemandData(res.data.data);
      } else if (tab === 'maintenance' && maintenanceData.length === 0) {
        const res = await api.get('/ai/maintenance');
        setMaintenanceData(res.data.data.recommendations || []);
      } else if (tab === 'routes' && !routeData) {
        const res = await api.get('/ai/route-optimization');
        setRouteData(res.data.data);
      } else if (tab === 'insights' && !businessInsights) {
        const res = await api.get('/ai/business-insights');
        setBusinessInsights(res.data.data);
      }
    } catch (err) {
      console.error('AI query error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
          <BrainCircuit size={14} /> Modular Operations Intelligence Suite
        </div>
        <h1 style={{ fontSize: '1.85rem' }}>AI Predictive Operations Center</h1>
        <p>Real-time predictive telemetry: late return classifiers, time-series demand models, maintenance wear scoring, and dispatch route sequencing.</p>
      </div>

      {/* AI Module Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('late-risk')}
          className={`btn btn-sm ${activeTab === 'late-risk' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <AlertTriangle size={15} /> Late Return Risk Classifier
        </button>
        <button
          onClick={() => setActiveTab('demand')}
          className={`btn btn-sm ${activeTab === 'demand' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <TrendingUp size={15} /> 7-Day Demand Forecasting
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`btn btn-sm ${activeTab === 'maintenance' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Wrench size={15} /> Predictive Asset Wear
        </button>
        <button
          onClick={() => setActiveTab('routes')}
          className={`btn btn-sm ${activeTab === 'routes' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Truck size={15} /> Smart Delivery Route Optimizer
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`btn btn-sm ${activeTab === 'insights' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Sparkles size={15} /> Operational Business Insights
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card skeleton" style={{ height: 120 }}></div>
          ))}
        </div>
      )}

      {/* TAB 1: Late Return Risk */}
      {!loading && activeTab === 'late-risk' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Rental Risk Matrix</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {riskData.length === 0 ? (
              <div className="card empty-state">
                <CheckCircle2 className="empty-icon" color="var(--success)" />
                <h3>Zero Active Risk Orders</h3>
                <p>No active rental orders meet threshold risk levels right now.</p>
              </div>
            ) : (
              riskData.map((item, idx) => (
                <div
                  key={idx}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    borderLeft: item.riskLevel === 'High' ? '5px solid var(--danger)' : item.riskLevel === 'Medium' ? '5px solid var(--warning)' : '5px solid var(--success)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem' }}>
                        Order #{item.orderNumber} — {item.customerName}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Deadline: {new Date(item.scheduledReturn).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        className={`badge ${
                          item.riskLevel === 'High'
                            ? 'badge-danger'
                            : item.riskLevel === 'Medium'
                            ? 'badge-warning'
                            : 'badge-success'
                        }`}
                        style={{ fontSize: '0.85rem' }}
                      >
                        {item.riskLevel} Risk ({item.riskScore}/100)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.keyFactors?.map((fac, fIdx) => (
                      <span key={fIdx} style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        • {fac}
                      </span>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <strong>Recommended Action:</strong> {item.recommendation}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Demand Forecasting */}
      {!loading && activeTab === 'demand' && demandData && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary-border)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Executive Forecast Synthesis</h3>
            <p>{demandData.insight}</p>
          </div>

          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>7-Day Daily Demand Horizon</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {demandData.forecastDays?.map((d, i) => (
              <div
                key={i}
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: d.demandLevel.includes('Peak') ? 'var(--warning-bg)' : 'var(--bg-surface)',
                  border: d.demandLevel.includes('Peak') ? '1px solid var(--warning-border)' : '1px solid var(--border-color)',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{d.dayName}</span>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0' }}>{d.expectedBookings}</p>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{d.demandLevel}</span>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>High-Velocity Equipment Watchlist</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {demandData.topDemanded?.map((t, i) => (
              <div key={i} className="card">
                <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{t.title}</strong>
                <span className="badge badge-warning" style={{ marginBottom: '0.5rem' }}>
                  Stockout Risk: {t.projectedStockoutRisk}
                </span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Recommended minimum turnaround buffer: {t.recommendedBuffer} units
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Predictive Maintenance */}
      {!loading && activeTab === 'maintenance' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Fleet Wear & Overhaul Scoring</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Equipment Model</th>
                  <th>Serial #</th>
                  <th>Wear Hours</th>
                  <th>Rentals Count</th>
                  <th>Wear Score</th>
                  <th>Advisory Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceData.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{item.productTitle}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.brand}
                      </span>
                    </td>
                    <td>
                      <code>{item.serialNumber}</code>
                    </td>
                    <td>{item.hoursUsed} hrs</td>
                    <td>{item.rentalsCount}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 60, height: 8, backgroundColor: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${item.maintenanceScore}%`,
                              height: '100%',
                              backgroundColor: item.maintenanceScore > 75 ? 'var(--danger)' : item.maintenanceScore > 45 ? 'var(--warning)' : 'var(--success)',
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{item.maintenanceScore}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>{item.recommendation}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Route Optimization */}
      {!loading && activeTab === 'routes' && routeData && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Delivery Run Overview</h3>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
              <span>Depot: <strong>{routeData.depot?.name}</strong></span>
              <span>Total Delivery Stops: <strong>{routeData.totalStops}</strong></span>
              <span>Optimized Total Distance: <strong>{routeData.totalDistanceKm} km</strong></span>
              <span>Estimated Duration: <strong>{routeData.estimatedDurationHours} hours</strong></span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Sequenced Stop Itinerary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {routeData.optimizedRoute?.length === 0 ? (
              <div className="card empty-state">
                <Truck className="empty-icon" />
                <h3>No Pending Doorstep Deliveries</h3>
                <p>All current confirmed orders are designated for customer store pickup.</p>
              </div>
            ) : (
              routeData.optimizedRoute.map((stop, idx) => (
                <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                    }}
                  >
                    {stop.sequence}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{stop.recipient} (Order #{stop.orderNumber})</strong>
                      <span className="badge badge-info">Est. Arrival: {stop.estimatedArrivalTime}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stop.address}</span>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Leg Distance:</span>
                    <strong style={{ display: 'block' }}>{stop.legDistanceKm} km</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: AI Business Insights */}
      {!loading && activeTab === 'insights' && businessInsights && (
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Automated Management Synthesis</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {businessInsights.insights?.map((ins, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-info">{ins.category}</span>
                  <span
                    className={`badge ${
                      ins.impact === 'Critical'
                        ? 'badge-danger'
                        : ins.impact === 'High'
                        ? 'badge-warning'
                        : 'badge-neutral'
                    }`}
                  >
                    {ins.impact} Impact
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{ins.title}</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>{ins.summary}</p>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  <strong>Actionable Strategy:</strong> {ins.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAIInsightsPage;
