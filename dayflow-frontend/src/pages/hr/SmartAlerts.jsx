import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Filter,
  Eye,
  Check,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import AlertCard from '../../components/alerts/AlertCard';
import FilterBar from '../../components/tables/FilterBar';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useToast } from '../../hooks/useToast';
import alertsApi from '../../api/alertsApi';

export const SmartAlerts = () => {
  const { success, error } = useToast();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal resolution state
  const [selectedAlertToResolve, setSelectedAlertToResolve] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolveLoading, setResolveLoading] = useState(false);

  // View Modal state
  const [viewAlert, setViewAlert] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, statusFilter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertsApi.getAll({
        severity: severityFilter !== 'all' ? severityFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setAlerts(res.data || []);
    } catch (err) {
      error('Failed to load smart HR alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertItem) => {
    try {
      await alertsApi.acknowledge(alertItem.id);
      success(`Alert "${alertItem.title}" acknowledged.`);
      fetchAlerts();
    } catch (err) {
      error('Failed to acknowledge alert');
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAlertToResolve) return;
    setResolveLoading(true);
    try {
      await alertsApi.resolve(selectedAlertToResolve.id, resolutionNotes);
      success(`Smart Alert "${selectedAlertToResolve.title}" marked as resolved!`);
      setSelectedAlertToResolve(null);
      setResolutionNotes('');
      fetchAlerts();
    } catch (err) {
      error('Failed to resolve alert');
    } finally {
      setResolveLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Smart HR Predictive Alerts"
        subtitle="Automated workforce pattern detection engine flagging attendance anomalies and team availability risks."
        breadcrumbs={['HR Operations', 'Smart Alerts']}
      />

      {/* Filter toolbar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Active Alert Feed ({alerts.length})
            </span>
          </div>

          <FilterBar
            filters={[
              {
                key: 'severity',
                label: 'Severity',
                options: [
                  { label: 'High Severity', value: 'high' },
                  { label: 'Medium Severity', value: 'medium' },
                  { label: 'Low Severity', value: 'low' },
                ],
              },
              {
                key: 'status',
                label: 'Status',
                options: [
                  { label: 'Open', value: 'open' },
                  { label: 'Acknowledged', value: 'acknowledged' },
                  { label: 'Resolved', value: 'resolved' },
                ],
              },
            ]}
            values={{ severity: severityFilter, status: statusFilter }}
            onChange={(key, val) => {
              if (key === 'severity') setSeverityFilter(val);
              if (key === 'status') setStatusFilter(val);
            }}
            onReset={() => {
              setSeverityFilter('all');
              setStatusFilter('all');
            }}
          />
        </div>
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onView={(a) => setViewAlert(a)}
            onAcknowledge={handleAcknowledge}
            onResolve={(a) => setSelectedAlertToResolve(a)}
          />
        ))}
      </div>

      {/* Resolve Alert Modal */}
      <Modal
        isOpen={!!selectedAlertToResolve}
        onClose={() => setSelectedAlertToResolve(null)}
        title={`Resolve Alert: ${selectedAlertToResolve?.title}`}
        subtitle={`Target: ${selectedAlertToResolve?.target}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelectedAlertToResolve(null)} disabled={resolveLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleResolveSubmit} loading={resolveLoading} icon={CheckCircle2}>
              Mark as Resolved
            </Button>
          </>
        }
      >
        <form onSubmit={handleResolveSubmit}>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
            {selectedAlertToResolve?.message}
          </p>

          <div className="form-group">
            <label className="form-label required">Resolution Action / Notes</label>
            <textarea
              rows={3}
              className="form-control"
              placeholder="e.g. Conducted 1-on-1 check-in; agreed on shifted work hours to accommodate commute schedule."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>

      {/* View Alert Details Modal */}
      <Modal
        isOpen={!!viewAlert}
        onClose={() => setViewAlert(null)}
        title={viewAlert?.title}
        subtitle={`Created on ${viewAlert?.date}`}
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setViewAlert(null)}>
            Close
          </Button>
        }
      >
        {viewAlert && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--slate-500)' }}>Severity Level:</span>
              <Badge variant={viewAlert.severity}>{viewAlert.severity.toUpperCase()}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--slate-500)' }}>Current Status:</span>
              <Badge variant={viewAlert.status}>{viewAlert.status.toUpperCase()}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--slate-500)' }}>Target Entity:</span>
              <strong>{viewAlert.target}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', marginBottom: '0.375rem' }}>Full Description:</span>
              <p style={{ color: 'var(--slate-800)', lineHeight: '1.5', padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                {viewAlert.message}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SmartAlerts;
