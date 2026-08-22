import React, { useState, useEffect } from 'react';
import {
  CalendarRange,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  Eye,
  Filter,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/tables/DataTable';
import FilterBar from '../../components/tables/FilterBar';
import SearchBar from '../../components/tables/SearchBar';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import leaveApi from '../../api/leaveApi';
import { formatDate } from '../../utils/dateUtils';

export const LeaveRequests = () => {
  const { success, error } = useToast();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Confirmation state for approve / reject
  const [activeAction, setActiveAction] = useState(null); // { type: 'approve'|'reject', leave: {} }
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, [search, statusFilter]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getAllLeaves({ search, status: statusFilter !== 'all' ? statusFilter : undefined });
      setLeaves(res.data || []);
    } catch (err) {
      error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleActionConfirm = async () => {
    if (!activeAction) return;
    setActionLoading(true);
    try {
      if (activeAction.type === 'approve') {
        await leaveApi.approve(activeAction.leave.id, adminNotes);
        success(`Leave request for ${activeAction.leave.employeeName} approved!`);
      } else {
        await leaveApi.reject(activeAction.leave.id, adminNotes);
        success(`Leave request for ${activeAction.leave.employeeName} rejected.`);
      }
      setActiveAction(null);
      setAdminNotes('');
      fetchLeaves();
    } catch (err) {
      error('Failed to process leave action');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employeeName',
      render: (_, row) => (
        <div>
          <strong style={{ color: 'var(--slate-900)' }}>{row.employeeName}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{row.employeeId} • {row.department}</div>
        </div>
      ),
    },
    {
      header: 'Leave Type',
      accessor: 'leaveType',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>{val}</span>,
    },
    {
      header: 'Duration & Dates',
      accessor: 'startDate',
      render: (_, row) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <div>{formatDate(row.startDate)} to {formatDate(row.endDate)}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>
            {row.days} {row.days === 1 ? 'day' : 'days'}
          </span>
        </div>
      ),
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (val) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', maxWidth: '280px', display: 'inline-block' }} className="truncate">
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
        title="Leave Approvals & Workflow"
        subtitle="Review employee time-off requests, check scheduling conflicts, and issue decisions."
        breadcrumbs={['HR Operations', 'Leave Approvals']}
      />

      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search employee, leave type, reason..."
          />

          <FilterBar
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { label: 'Pending Review', value: 'pending' },
                  { label: 'Approved', value: 'approved' },
                  { label: 'Rejected', value: 'rejected' },
                ],
              },
            ]}
            values={{ status: statusFilter }}
            onChange={(key, val) => setStatusFilter(val)}
            onReset={() => {
              setStatusFilter('all');
              setSearch('');
            }}
          />
        </div>

        <DataTable
          columns={columns}
          data={leaves}
          loading={loading}
          actions={(row) => (
            <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
              {row.status === 'pending' ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Check}
                    onClick={() => setActiveAction({ type: 'approve', leave: row })}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={X}
                    onClick={() => setActiveAction({ type: 'reject', leave: row })}
                  >
                    Reject
                  </Button>
                </>
              ) : (
                <Badge variant={row.status}>{row.status.toUpperCase()}</Badge>
              )}
            </div>
          )}
        />
      </div>

      {/* Decision Confirmation Modal */}
      <Modal
        isOpen={!!activeAction}
        onClose={() => setActiveAction(null)}
        title={`${activeAction?.type === 'approve' ? 'Approve' : 'Reject'} Leave Request`}
        subtitle={`Employee: ${activeAction?.leave.employeeName} (${activeAction?.leave.leaveType})`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setActiveAction(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant={activeAction?.type === 'approve' ? 'primary' : 'danger'}
              onClick={handleActionConfirm}
              loading={actionLoading}
            >
              {activeAction?.type === 'approve' ? 'Authorize Leave' : 'Reject Application'}
            </Button>
          </>
        }
      >
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1rem', lineHeight: '1.5' }}>
            {activeAction?.type === 'approve'
              ? `Are you sure you want to approve this ${activeAction?.leave.days}-day request from ${formatDate(activeAction?.leave.startDate)} to ${formatDate(activeAction?.leave.endDate)}?`
              : `Are you sure you want to decline this leave request?`}
          </p>

          <div className="form-group">
            <label className="form-label">Manager / HR Notes (Optional)</label>
            <textarea
              rows={2}
              className="form-control"
              placeholder="Add optional notes for the employee..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeaveRequests;
