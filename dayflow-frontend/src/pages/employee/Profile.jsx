import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  MapPin,
  Shield,
  Edit2,
  Check,
  Lock,
  Camera,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import employeeApi from '../../api/employeeApi';
import { formatDate } from '../../utils/dateUtils';

export const Profile = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Editable personal info
  const [formData, setFormData] = useState({
    phone: user?.phone || '+1 (555) 234-5678',
    address: user?.address || '742 Evergreen Terrace, San Francisco, CA',
    emergencyContact: 'Mark Jenkins (+1 555-987-6543)',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await employeeApi.update(user?.id || 'emp-101', formData);
      success('Contact details updated successfully!');
      setIsEditing(false);
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal contact details and view official HR credentials."
        breadcrumbs={['Workspace', 'My Profile']}
        actions={
          isEditing ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)} disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" icon={Check} onClick={handleSave} loading={loading}>
                Save Changes
              </Button>
            </div>
          ) : (
            <Button variant="secondary" size="sm" icon={Edit2} onClick={() => setIsEditing(true)}>
              Edit Contact Info
            </Button>
          )
        }
      />

      {/* Hero Banner with Avatar & Identity */}
      <div
        className="card"
        style={{
          padding: '2rem',
          marginBottom: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.6) 0%, rgba(255, 255, 255, 1) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
              alt={user?.name || 'Avatar'}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #ffffff',
                boxShadow: 'var(--shadow-md)',
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {user?.name || 'Sarah Jenkins'}
              </h2>
              <Badge variant="success">Active Employee</Badge>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--primary-700)',
                  backgroundColor: 'var(--primary-100)',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '9999px',
                }}
              >
                ID: {user?.employeeId || 'DF-101'}
              </span>
            </div>

            <p style={{ fontSize: '0.9375rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
              {user?.designation || 'Senior Staff Engineer'} • {user?.department || 'Engineering'}
            </p>

            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--slate-500)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Mail size={14} /> {user?.email || 'sarah.jenkins@dayflow.io'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Building size={14} /> Team: {user?.team || 'Frontend Platform'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Calendar size={14} /> Joined {formatDate(user?.joiningDate || '2023-01-15')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* Section 1: Employment Details (Read-only HR Managed) */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} className="text-primary" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  Employment & Organization
                </h3>
              </div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--slate-500)',
                  backgroundColor: 'var(--slate-100)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <Lock size={11} /> HR Managed
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>Official Employee ID</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-900)' }}>{user?.employeeId || 'DF-101'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>Department</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-900)' }}>{user?.department || 'Engineering'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>Team / Pod</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-900)' }}>{user?.team || 'Frontend Platform'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>Designation</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-900)' }}>{user?.designation || 'Senior Staff Engineer'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>Reporting Manager</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-900)' }}>{user?.manager || 'David Miller (VP Eng)'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>Date of Joining</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-900)' }}>{formatDate(user?.joiningDate || '2023-01-15')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>Employment Status</span>
                <Badge variant="success">Active (Full-time)</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Contact Information (Editable) */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} className="text-primary" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  Personal Contact Details
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                {isEditing ? 'Editing Enabled' : 'Self-Editable'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group m-0">
                <label className="form-label">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                ) : (
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                    {formData.phone}
                  </div>
                )}
              </div>

              <div className="form-group m-0">
                <label className="form-label">Residential Address</label>
                {isEditing ? (
                  <textarea
                    rows={2}
                    className="form-control"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                ) : (
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                    {formData.address}
                  </div>
                )}
              </div>

              <div className="form-group m-0">
                <label className="form-label">Emergency Contact Person</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                ) : (
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                    {formData.emergencyContact}
                  </div>
                )}
              </div>

              {isEditing && (
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSave} loading={loading}>
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
