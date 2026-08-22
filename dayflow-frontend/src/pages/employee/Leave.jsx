import React, { useState, useEffect } from 'react';
import {
  CalendarRange,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/tables/DataTable';
import FilterBar from '../../components/tables/FilterBar';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LeaveForm from '../../components/forms/LeaveForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import leaveApi from '../../api/leaveApi';
import { formatDate } from '../../utils/dateUtils';
import { mockLeaveBalances } from '../../utils/mockData';

export const Leave = () => {
  const { success, error } = useToast();

  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState(mockLeaveBalances);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  // Cancel Confirmation
  const [selectedLeaveToCancel, setSelectedLeaveToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getMyLeaves();
      setLeaves(res.data || []);
      if (res.balances) setBalances(res.balances);
    } catch (err) {
      error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (formData) => {
    setApplyLoading(true);
    try {
      const res = await leaveApi.apply(formData);
      success(res.message || 'Leave applied successfully!');
      setIsApplyModalOpen(false);
      fetchLeaves();
    } catch (err) {
      error(err.message || 'Failed to submit leave request');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleCancelLeave = async () => {
    if (!selectedLeaveToCancel) return;
    setCancelLoading(true);
    try {
      await leaveApi.cancel(selectedLeaveToCancel.id);
      success('Leave request cancelled.');
      setSelectedLeaveToCancel(null);
      fetchLeaves();
    } catch (err) {
      error(err.message || 'Failed to cancel leave');
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    return true;
  });

  const columns = [
    {
      header: 'Leave Type',
      accessor: 'leaveType',
      render: (val) => <strong style={{ color: 'var(--slate-900)' }}>{val}</strong>,
    },
    {
      header: 'Date Range',
      accessor: 'startDate',
      render: (_, row) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <div>{formatDate(row.startDate)} – {formatDate(row.endDate)}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>({row.days} {row.days === 1 ? 'day' : 'days'})</span>
        </div>
      ),
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (val) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', maxWidth: '300px', display: 'inline-block' }} className="truncate">
          {val}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => <Badge variant={val}>{val.toUpperCase()}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Leave Management"
        subtitle="View your allocated leave balances and apply for time off."
        breadcrumbs={['Workspace', 'Leave']}
        actions={
          <Button variant="primary" size="sm" icon={PlusCircle} onClick={() => setIsApplyModalOpen(true)}>
            Apply for Leave
          </Button>
        }
      />

      {/* Leave Balances 4-Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-500)' }}>ANNUAL LEAVE</span>
            <span className="badge badge-primary">Standard</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.5rem' }}>
            {balances.annual?.available} <span style={{ fontSize: '0.875rem', color: 'var(--slate-400)', fontWeight: 500 }}>/ {balances.annual?.total} days</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            {balances.annual?.used} days taken this year
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-500)' }}>CASUAL LEAVE</span>
            <span className="badge badge-info">Flex</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.5rem' }}>
            {balances.casual?.available} <span style={{ fontSize: '0.875rem', color: 'var(--slate-400)', fontWeight: 500 }}>/ {balances.casual?.total} days</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            {balances.casual?.used} days taken this year
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-500)' }}>SICK LEAVE</span>
            <span className="badge badge-warning">Medical</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.5rem' }}>
            {balances.sick?.available} <span style={{ fontSize: '0.875rem', color: 'var(--slate-400)', fontWeight: 500 }}>/ {balances.sick?.total} days</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            {balances.sick?.used} days taken this year
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-500)' }}>EMERGENCY LEAVE</span>
            <span className="badge badge-danger">Urgent</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.5rem' }}>
            {balances.emergency?.available} <span style={{ fontSize: '0.875rem', color: 'var(--slate-400)', fontWeight: 500 }}>/ {balances.emergency?.total} days</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            {balances.emergency?.used} days taken this year
          </div>
        </div>
      </div>

      {/* Leave Application History Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Leave History & Requests
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              All submitted time off applications
            </span>
          </div>

          <FilterBar
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { label: 'Pending', value: 'pending' },
                  { label: 'Approved', value: 'approved' },
                  { label: 'Rejected', value: 'rejected' },
                  { label: 'Cancelled', value: 'cancelled' },
                ],
              },
            ]}
            values={{ status: filterStatus }}
            onChange={(key, val) => setFilterStatus(val)}
            onReset={() => setFilterStatus('all')}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredLeaves}
          loading={loading}
          actions={(row) => (
            <div>
              {row.status === 'pending' && (
                <Button
                  variant="ghost"
                  size="sm"
                  style={{ color: 'var(--danger-600)' }}
                  onClick={() => setSelectedLeaveToCancel(row)}
                >
                  Cancel Request
                </Button>
              )}
            </div>
          )}
        />
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Leave"
        subtitle="Submit a new time-off application for HR and manager approval."
      >
        <LeaveForm onSubmit={handleApplyLeave} onCancel={() => setIsApplyModalOpen(false)} loading={applyLoading} />
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!selectedLeaveToCancel}
        onClose={() => setSelectedLeaveToCancel(null)}
        onConfirm={handleCancelLeave}
        title="Cancel Leave Application"
        message={`Are you sure you want to cancel your ${selectedLeaveToCancel?.leaveType} request for ${selectedLeaveToCancel?.startDate}?`}
        confirmText="Cancel Leave"
        variant="danger"
        loading={cancelLoading}
      />
    </div>
  );
};

export default Leave;
