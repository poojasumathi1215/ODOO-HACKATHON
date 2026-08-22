import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Lock, Shield, Moon, Globe, Check } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';

export const Settings = () => {
  const { success } = useToast();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setPassLoading(true);
    setTimeout(() => {
      setPassLoading(false);
      success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 600);
  };

  const handleSavePreferences = () => {
    success('Workspace preferences saved');
  };

  return (
    <div>
      <PageHeader
        title="Account & System Settings"
        subtitle="Manage notification frequencies, application preferences, and security passwords."
        breadcrumbs={['Workspace', 'Settings']}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* Notification Preferences */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Bell size={18} className="text-primary" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Notification Preferences
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>Email Alerts on Leave Status</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Receive emails when your leave request is approved or rejected</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  style={{ accentColor: 'var(--primary-600)', width: '18px', height: '18px' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>Monthly Payslip Disbursal Notice</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Instant push notification as soon as payslip is published</div>
                </div>
                <input
                  type="checkbox"
                  checked={pushNotifs}
                  onChange={(e) => setPushNotifs(e.target.checked)}
                  style={{ accentColor: 'var(--primary-600)', width: '18px', height: '18px' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>Weekly Workforce Digest</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Weekly summary of logged hours and wellness signals</div>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  style={{ accentColor: 'var(--primary-600)', width: '18px', height: '18px' }}
                />
              </label>

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <Button variant="secondary" size="sm" onClick={handleSavePreferences}>
                  Save Notification Preferences
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Lock size={18} className="text-primary" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Password & Security
              </h3>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label required">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <Button type="submit" variant="primary" size="sm" loading={passLoading}>
                  Update Password
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
