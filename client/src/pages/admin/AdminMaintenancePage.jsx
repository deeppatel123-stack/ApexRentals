import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Wrench, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';

export const AdminMaintenancePage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/maintenance');
      setLogs(res.data.data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRepair = async (id) => {
    const cost = prompt('Enter final workshop repair cost (₹):', '500');
    if (cost !== null) {
      try {
        await api.put(`/maintenance/${id}`, {
          status: 'completed',
          actualCost: Number(cost),
        });
        alert('Work order marked completed. Asset has been restored to available inventory fleet!');
        fetchLogs();
      } catch (err) {
        alert('Failed to update maintenance order.');
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem' }}>Maintenance & Workshop Orders</h1>
        <p>Manage repair tickets triggered by return damage inspections and equipment wear thresholds.</p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Equipment Asset</th>
              <th>Serial Number</th>
              <th>Issue Description</th>
              <th>Severity</th>
              <th>Est. Cost</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>
                  <strong>{log.inventoryItemId?.productId?.title}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Workshop: {log.serviceCenter}
                  </span>
                </td>
                <td>
                  <code>{log.inventoryItemId?.serialNumber}</code>
                </td>
                <td>{log.issueDescription}</td>
                <td>
                  <span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>
                    {log.severity.replace('_', ' ')}
                  </span>
                </td>
                <td>₹{log.actualCost || log.estimatedCost || 0}</td>
                <td>
                  <span
                    className={`badge ${
                      log.status === 'completed'
                        ? 'badge-success'
                        : log.status === 'in_progress'
                        ? 'badge-warning'
                        : 'badge-danger'
                    }`}
                  >
                    {log.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  {log.status !== 'completed' ? (
                    <button
                      onClick={() => handleCompleteRepair(log._id)}
                      className="btn btn-success btn-sm"
                    >
                      <CheckCircle size={14} /> Restore to Fleet
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMaintenancePage;
