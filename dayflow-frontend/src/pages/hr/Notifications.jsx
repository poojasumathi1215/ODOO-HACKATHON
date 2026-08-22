import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../hooks/useToast';
import notificationApi from '../../api/notificationApi';

export const Notifications = () => {
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifs();
  }, []);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getAll();
      setNotifications(res.data || []);
    } catch (err) {
      error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      success('Notification marked as read');
    } catch (err) {
      error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      success('All notifications marked as read');
    } catch (err) {
      error('Failed to update notifications');
    }
  };

  return (
    <div>
      <PageHeader
        title="Administrative Alerts & Notifications"
        subtitle="System alerts, workforce anomaly signals, and operational workflows."
        breadcrumbs={['HR Operations', 'Notifications']}
        actions={
          <Button variant="secondary" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
        }
      />

      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                backgroundColor: item.read ? '#ffffff' : 'var(--primary-50)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <div
                  style={{
                    padding: '0.5rem',
                    borderRadius: '50%',
                    backgroundColor: item.type === 'smart_alert' ? 'var(--danger-50)' : 'var(--primary-100)',
                    color: item.type === 'smart_alert' ? 'var(--danger-600)' : 'var(--primary-600)',
                  }}
                >
                  {item.type === 'smart_alert' ? <ShieldAlert size={18} /> : <Bell size={18} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {item.title}
                    </h4>
                    {!item.read && <span className="badge badge-primary">NEW</span>}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', marginTop: '0.25rem', lineHeight: '1.45' }}>
                    {item.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.5rem' }}>
                    <Clock size={12} />
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              </div>

              {!item.read && (
                <Button variant="ghost" size="sm" icon={Check} onClick={() => handleMarkRead(item.id)}>
                  Mark Read
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
