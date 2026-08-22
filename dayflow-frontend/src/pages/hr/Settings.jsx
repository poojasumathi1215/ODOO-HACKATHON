import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Sliders, Bell, Database, Check } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';

export const Settings = () => {
  const { success } = useToast();

  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('17:30');
  const [gracePeriod, setGracePeriod] = useState(15);
  const [declineThreshold, setDeclineThreshold] = useState(15);
  const [teamAvailabilityThreshold, setTeamAvailabilityThreshold] = useState(40);

  const handleSavePolicy = (e) => {
    e.preventDefault();
    success('HR Organization policies & Smart Alert thresholds updated successfully!');
  };

  return (
    <div>
      <PageHeader
        title="Organization & System Configuration"
        subtitle="Manage company working hours, attendance policies, leave allocations, and Smart HR Alert trigger thresholds."
        breadcrumbs={['HR Operations', 'Settings']}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* Attendance & Shift Policy */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Sliders size={18} className="text-primary" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Shift & Working Hours Policy
              </h3>
            </div>

            <form onSubmit={handleSavePolicy}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label required">Standard Shift Start</label>
                  <input
                    type="time"
                    className="form-control"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Standard Shift End</label>
                  <input
                    type="time"
                    className="form-control"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Grace Period for Late Check-in (Minutes)</label>
                <input
                  type="number"
                  className="form-control"
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(Number(e.target.value))}
                />
                <span className="form-hint">Punches logged beyond this window are marked as Late.</span>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <Button type="submit" variant="primary" size="sm">
                  Save Shift Settings
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Smart HR Alert Trigger Thresholds */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Shield size={18} className="text-primary" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Smart HR Alert Sensitivity Thresholds
              </h3>
            </div>

            <form onSubmit={handleSavePolicy}>
              <div className="form-group">
                <label className="form-label">Attendance Decline Sensitivity (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={declineThreshold}
                  onChange={(e) => setDeclineThreshold(Number(e.target.value))}
                />
                <span className="form-hint">Triggers high-severity alert when 30-day attendance rate drops by this percentage.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Team Availability Risk Limit (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={teamAvailabilityThreshold}
                  onChange={(e) => setTeamAvailabilityThreshold(Number(e.target.value))}
                />
                <span className="form-hint">Triggers alert when concurrent team leave requests exceed this capacity.</span>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <Button type="submit" variant="primary" size="sm">
                  Save Sensitivity Rules
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
