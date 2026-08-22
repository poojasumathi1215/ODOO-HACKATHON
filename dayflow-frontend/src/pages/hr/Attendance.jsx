import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Users,
  Clock,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CalendarRange,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/tables/DataTable';
import SearchBar from '../../components/tables/SearchBar';
import FilterBar from '../../components/tables/FilterBar';
import ChartCard from '../../components/dashboard/ChartCard';
import StatCard from '../../components/dashboard/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useToast } from '../../hooks/useToast';
import attendanceApi from '../../api/attendanceApi';
import { formatDate } from '../../utils/dateUtils';
import { exportToCSV } from '../../utils/exportUtils';
import { DEPARTMENTS } from '../../utils/constants';

export const Attendance = () => {
  const { success, error } = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [summary, setSummary] = useState({
    present: 42,
    absent: 3,
    late: 4,
    halfDay: 1,
    onLeave: 2,
  });

  useEffect(() => {
    fetchAttendance();
  }, [search, deptFilter, statusFilter]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getAllAttendance({
        search,
        department: deptFilter !== 'all' ? deptFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setRecords(res.data || []);
    } catch (err) {
      error('Failed to load company attendance log');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const dataToExport = records.map((r) => ({
      Date: r.date,
      EmployeeID: r.employeeId,
      EmployeeName: r.employeeName,
      Department: r.department,
      CheckIn: r.checkIn,
      CheckOut: r.checkOut,
      Hours: r.hours,
      Status: r.status,
    }));
    exportToCSV(dataToExport, 'Workforce_Daily_Attendance.csv');
    success('Exported attendance log to CSV');
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employeeName',
      render: (_, row) => (
        <div>
          <strong style={{ color: 'var(--slate-900)' }}>{row.employeeName}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{row.employeeId}</div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (val) => <span style={{ color: 'var(--slate-700)' }}>{val}</span>,
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (val) => formatDate(val),
    },
    {
      header: 'Punch In',
      accessor: 'checkIn',
      render: (val) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={13} className="text-slate-400" /> {val}
        </span>
      ),
    },
    {
      header: 'Punch Out',
      accessor: 'checkOut',
      render: (val) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={13} className="text-slate-400" /> {val}
        </span>
      ),
    },
    {
      header: 'Hours Logged',
      accessor: 'hours',
      render: (val) => <strong>{val} hrs</strong>,
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
        title="Workforce Attendance Monitor"
        subtitle="Live shift tracking, punctuality auditing, and company-wide timesheet records."
        breadcrumbs={['HR Operations', 'Attendance']}
        actions={
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>
            Export Daily CSV
          </Button>
        }
      />

      {/* 5 Status Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard
          title="Present"
          value={summary.present}
          description="87.5% workforce"
          icon={CheckCircle2}
          accentColor="success"
        />

        <StatCard
          title="Late Arrivals"
          value={summary.late}
          description=">15 mins late"
          icon={AlertTriangle}
          accentColor="warning"
        />

        <StatCard
          title="Absences"
          value={summary.absent}
          description="Unscheduled today"
          icon={XCircle}
          accentColor="danger"
        />

        <StatCard
          title="Half-Day"
          value={summary.halfDay}
          description="Approved half-shifts"
          icon={Clock}
          accentColor="info"
        />

        <StatCard
          title="On Approved Leave"
          value={summary.onLeave}
          description="Annual / Casual"
          icon={CalendarRange}
          accentColor="primary"
        />
      </div>

      {/* Attendance Grid & Filters */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search employee name or ID..."
          />

          <FilterBar
            filters={[
              {
                key: 'department',
                label: 'Department',
                options: DEPARTMENTS.map((d) => ({ label: d, value: d })),
              },
              {
                key: 'status',
                label: 'Status',
                options: [
                  { label: 'Present', value: 'present' },
                  { label: 'Late', value: 'late' },
                  { label: 'Absent', value: 'absent' },
                  { label: 'Leave', value: 'leave' },
                ],
              },
            ]}
            values={{ department: deptFilter, status: statusFilter }}
            onChange={(key, val) => {
              if (key === 'department') setDeptFilter(val);
              if (key === 'status') setStatusFilter(val);
            }}
            onReset={() => {
              setDeptFilter('all');
              setStatusFilter('all');
              setSearch('');
            }}
          />
        </div>

        <DataTable columns={columns} data={records} loading={loading} />
      </div>
    </div>
  );
};

export default Attendance;
