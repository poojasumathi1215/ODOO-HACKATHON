import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  RefreshCw,
  Filter,
  FileText,
  Calendar,
  Users,
  DollarSign,
  HeartPulse,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/tables/DataTable';
import FilterBar from '../../components/tables/FilterBar';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import reportApi from '../../api/reportApi';
import { exportToCSV, triggerPrint } from '../../utils/exportUtils';
import { DEPARTMENTS } from '../../utils/constants';

export const Reports = () => {
  const { success, error } = useToast();

  const [activeReport, setActiveReport] = useState('employees'); // employees, attendance, leaves, payroll, wellness
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [department, setDepartment] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    generateReport();
  }, [activeReport, department]);

  const generateReport = async () => {
    setLoading(true);
    try {
      let res;
      const filters = { department: department !== 'all' ? department : undefined, startDate, endDate };
      if (activeReport === 'employees') {
        res = await reportApi.getEmployeeReport(filters);
      } else if (activeReport === 'attendance') {
        res = await reportApi.getAttendanceReport(filters);
      } else if (activeReport === 'leaves') {
        res = await reportApi.getLeaveReport(filters);
      } else if (activeReport === 'payroll') {
        res = await reportApi.getPayrollReport(filters);
      } else {
        res = await reportApi.getWellnessReport(filters);
      }
      setData(res.data || []);
    } catch (err) {
      error('Failed to generate report dataset');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data.length) {
      error('No data available to export');
      return;
    }
    exportToCSV(data, `DayFlow_${activeReport.toUpperCase()}_REPORT.csv`);
    success(`Exported ${activeReport} report to CSV`);
  };

  const reportTypes = [
    { id: 'employees', label: 'Employee Roster', icon: Users },
    { id: 'attendance', label: 'Attendance Timesheets', icon: Calendar },
    { id: 'leaves', label: 'Leave Utilization', icon: FileText },
    { id: 'payroll', label: 'Payroll & Compensation', icon: DollarSign },
    { id: 'wellness', label: 'Workforce Wellness', icon: HeartPulse },
  ];

  // Dynamic table columns based on the first data row keys
  const columns = data.length > 0
    ? Object.keys(data[0]).map((key) => ({
        header: key.replace(/([A-Z])/g, ' $1').trim(),
        accessor: key,
        render: (val) => (
          <span style={{ fontSize: '0.8125rem', color: 'var(--slate-800)' }}>
            {val !== null && val !== undefined ? String(val) : '—'}
          </span>
        ),
      }))
    : [];

  return (
    <div>
      <PageHeader
        title="Custom Reports & Auditing Center"
        subtitle="Generate filtered organizational reports, export structured CSV records, or send to printer."
        breadcrumbs={['HR Operations', 'Reports']}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" size="sm" icon={Printer} onClick={triggerPrint}>
              Print Report
            </Button>
            <Button variant="primary" size="sm" icon={Download} onClick={handleExportCSV}>
              Export to CSV
            </Button>
          </div>
        }
      />

      {/* Report Switcher Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {reportTypes.map((rt) => {
          const Icon = rt.icon;
          const isActive = activeReport === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => setActiveReport(rt.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${isActive ? 'var(--primary-500)' : 'var(--border-color)'}`,
                backgroundColor: isActive ? 'var(--primary-50)' : '#ffffff',
                color: isActive ? 'var(--primary-700)' : 'var(--slate-700)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{rt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Parameters */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-600)' }}>Department:</span>
              <select
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{ width: 'auto', height: '36px', fontSize: '0.8125rem' }}
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-600)' }}>Start:</span>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: 'auto', height: '36px', fontSize: '0.8125rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-600)' }}>End:</span>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: 'auto', height: '36px', fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={generateReport} loading={loading}>
            Refresh Report
          </Button>
        </div>
      </div>

      {/* Report Data Preview Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Dataset Preview ({data.length} Records)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              Verified official report generation timestamp: {new Date().toLocaleString()}
            </span>
          </div>
        </div>

        <DataTable columns={columns} data={data} loading={loading} />
      </div>
    </div>
  );
};

export default Reports;
