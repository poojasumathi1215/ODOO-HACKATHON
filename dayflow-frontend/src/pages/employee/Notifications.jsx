import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Clock, ArrowRight, Trash2 } from 'lucide-react';
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
  const [tab, setTab] = useState('all'); // all, unread

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

  const filtered = notifications.filter((n) => {
    if (tab === 'unread') return !n.read;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Notification Center"
        subtitle="Stay updated on leave approvals, payroll releases, and corporate announcements."
        breadcrumbs={['Workspace', 'Notifications']}
        actions={
          notifications.some((n) => !n.read) && (
            <Button variant="secondary" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
              Mark All as Read
            </Button>
          )
        }
      />

      <div className="card" style={{ padding: '1.5rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setTab('all')}
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: tab === 'all' ? 'var(--primary-50)' : 'transparent',
              color: tab === 'all' ? 'var(--primary-700)' : 'var(--slate-600)',
              fontWeight: tab === 'all' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            All Updates ({notifications.length})
          </button>
          <button
            onClick={() => setTab('unread')}
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: tab === 'unread' ? 'var(--primary-50)' : 'transparent',
              color: tab === 'unread' ? 'var(--primary-700)' : 'var(--slate-600)',
              fontWeight: tab === 'unread' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            Unread Only ({notifications.filter((n) => !n.read).length})
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description="You have no notifications pending your attention."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((item) => (
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
                      backgroundColor: item.read ? 'var(--slate-100)' : 'var(--primary-100)',
                      color: item.read ? 'var(--slate-500)' : 'var(--primary-600)',
                    }}
                  >
                    <Bell size={18} />
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
        )}
      </div>
    </div>
  );
};

export default Notifications;
