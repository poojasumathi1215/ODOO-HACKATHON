import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  CalendarCheck,
  CalendarRange,
  DollarSign,
  HeartPulse,
  FileText,
  Activity,
  Mail,
  Phone,
  Building,
  Shield,
  Clock,
  Download,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/tables/DataTable';
import WellnessScore from '../../components/wellness/WellnessScore';
import WellnessExplanation from '../../components/wellness/WellnessExplanation';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { useToast } from '../../hooks/useToast';
import employeeApi from '../../api/employeeApi';
import attendanceApi from '../../api/attendanceApi';
import leaveApi from '../../api/leaveApi';
import payrollApi from '../../api/payrollApi';
import wellnessApi from '../../api/wellnessApi';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { mockAuditActivities } from '../../utils/mockData';

export const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // overview, attendance, leave, payroll, wellness, documents, activity
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [wellness, setWellness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const empRes = await employeeApi.getById(id);
      setEmployee(empRes.data);

      const empId = empRes.data?.employeeId || id;
      const [attRes, leaveRes, payRes, wellRes] = await Promise.all([
        attendanceApi.getByEmployeeId(empId),
        leaveApi.getAllLeaves({ search: empRes.data?.name }),
        payrollApi.getByEmployeeId(empId),
        wellnessApi.getByEmployeeId(empId),
      ]);

      setAttendance(attRes.data || []);
      setLeaves(leaveRes.data || []);
      setPayrolls(payRes.data || []);
      setWellness(wellRes.data || null);
    } catch (err) {
      error('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !employee) {
    return <Loader text="Loading employee records..." />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'attendance', label: 'Attendance History', icon: CalendarCheck },
    { id: 'leave', label: 'Leave Requests', icon: CalendarRange },
    { id: 'payroll', label: 'Compensation & Payroll', icon: DollarSign },
    { id: 'wellness', label: 'Workforce Wellness', icon: HeartPulse },
    { id: 'documents', label: 'Documents & Contracts', icon: FileText },
    { id: 'activity', label: 'Audit Activity', icon: Activity },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link
          to="/hr/employees"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            color: 'var(--slate-500)',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Back to Directory
        </Link>
      </div>

      {/* Hero Header Card */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={employee.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            alt={employee.name}
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {employee.name}
              </h2>
              <Badge variant={employee.status}>{employee.status?.toUpperCase()}</Badge>
              <span className="badge badge-primary">ID: {employee.employeeId}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
              {employee.designation} • {employee.department} ({employee.team || 'Core Team'})
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              <span><Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />{employee.email}</span>
              <span><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />{employee.phone}</span>
            </div>
          </div>
        </div>

        <div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/hr/reports')}>
            Generate Dossier Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                border: 'none',
                borderBottom: `3px solid ${isActive ? 'var(--primary-600)' : 'transparent'}`,
                backgroundColor: 'transparent',
                color: isActive ? 'var(--primary-600)' : 'var(--slate-600)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
          <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
            <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
                Job & Organization Metadata
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Reporting Manager:</span>
                  <strong>{employee.manager || 'David Miller'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Department:</span>
                  <strong>{employee.department}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Date of Joining:</span>
                  <strong>{formatDate(employee.joiningDate)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Annual Base Salary:</span>
                  <strong>{formatCurrency(employee.salary || 135000)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
            <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
                Location & Personal
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Residential Address:</span>
                  <strong>{employee.address || '742 Evergreen Terrace, San Francisco, CA'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Phone:</span>
                  <strong>{employee.phone}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Emergency Contact:</span>
                  <strong>Primary Contact on File</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance */}
      {activeTab === 'attendance' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
            Daily Punch Log for {employee.name}
          </h3>
          <DataTable
            columns={[
              { header: 'Date', accessor: 'date', render: (val) => formatDate(val) },
              { header: 'Check In', accessor: 'checkIn' },
              { header: 'Check Out', accessor: 'checkOut' },
              { header: 'Hours', accessor: 'hours', render: (v) => `${v} hrs` },
              { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v}>{v.toUpperCase()}</Badge> },
            ]}
            data={attendance}
          />
        </div>
      )}

      {/* Tab 3: Leave */}
      {activeTab === 'leave' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
            Leave Applications
          </h3>
          <DataTable
            columns={[
              { header: 'Type', accessor: 'leaveType' },
              { header: 'Dates', accessor: 'startDate', render: (_, r) => `${formatDate(r.startDate)} - ${formatDate(r.endDate)} (${r.days}d)` },
              { header: 'Reason', accessor: 'reason' },
              { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v}>{v.toUpperCase()}</Badge> },
            ]}
            data={leaves}
          />
        </div>
      )}

      {/* Tab 4: Payroll */}
      {activeTab === 'payroll' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
            Payroll & Disbursals
          </h3>
          <DataTable
            columns={[
              { header: 'Month', accessor: 'month', render: (_, r) => `${r.month} ${r.year}` },
              { header: 'Basic', accessor: 'basicSalary', render: (v) => formatCurrency(v) },
              { header: 'Allowances', accessor: 'allowances', render: (v) => formatCurrency(v) },
              { header: 'Deductions', accessor: 'deductions', render: (v) => `-${formatCurrency(v)}` },
              { header: 'Net Payout', accessor: 'netSalary', render: (v) => <strong>{formatCurrency(v)}</strong> },
              { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v}>{v.toUpperCase()}</Badge> },
            ]}
            data={payrolls}
          />
        </div>
      )}

      {/* Tab 5: Wellness */}
      {activeTab === 'wellness' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
          <div style={{ gridColumn: 'span 12' }} className="lg:col-span-4 col-span-12">
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <WellnessScore score={wellness?.score || 88} indicator={wellness?.indicator || 'stable'} size="lg" />
            </div>
          </div>
          <div style={{ gridColumn: 'span 12' }} className="lg:col-span-8 col-span-12">
            <div className="card" style={{ padding: '1.5rem' }}>
              <WellnessExplanation
                attendancePercentage={wellness?.attendancePercentage || 96}
                absenceCount={wellness?.absenceCount || 1}
                leavePattern={wellness?.leavePattern || 'Evenly distributed across quarters'}
                trend={wellness?.trend || '+2% over 30 days'}
                explanation={wellness?.explanation || 'Attendance and punctuality trends are consistent and healthy.'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Documents */}
      {activeTab === 'documents' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
            Verified Organizational Documents
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['Employment_Agreement_Signed.pdf', 'W4_Tax_Withholding.pdf', 'Health_Insurance_Enrollment.pdf', 'Confidentiality_NDA.pdf'].map((doc, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={20} className="text-primary" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-900)' }}>{doc}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Verified & Archived in HR Vault</div>
                  </div>
                </div>
                <Button variant="secondary" size="sm" icon={Download} onClick={() => success(`Downloading ${doc}`)}>
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Activity */}
      {activeTab === 'activity' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
            Audit Log Timeline
          </h3>
          <ActivityFeed activities={mockAuditActivities} />
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
