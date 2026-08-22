import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Info,
  Download,
  Eye,
  Filter,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/tables/DataTable';
import SearchBar from '../../components/tables/SearchBar';
import FilterBar from '../../components/tables/FilterBar';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import WellnessScore from '../../components/wellness/WellnessScore';
import WellnessExplanation from '../../components/wellness/WellnessExplanation';
import { useToast } from '../../hooks/useToast';
import wellnessApi from '../../api/wellnessApi';
import { exportToCSV } from '../../utils/exportUtils';
import { DEPARTMENTS, WELLNESS_DISCLAIMER } from '../../utils/constants';

export const WellnessMonitor = () => {
  const { success, error } = useToast();

  const [wellnessList, setWellnessList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [indicatorFilter, setIndicatorFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Detailed Modal
  const [selectedEmpWellness, setSelectedEmpWellness] = useState(null);

  useEffect(() => {
    fetchWellness();
  }, [search, indicatorFilter, deptFilter]);

  const fetchWellness = async () => {
    setLoading(true);
    try {
      const res = await wellnessApi.getAllWellness({
        search,
        indicator: indicatorFilter !== 'all' ? indicatorFilter : undefined,
        department: deptFilter !== 'all' ? deptFilter : undefined,
      });
      setWellnessList(res.data || []);
    } catch (err) {
      error('Failed to load wellness matrix');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const dataToExport = wellnessList.map((w) => ({
      EmployeeID: w.employeeId,
      EmployeeName: w.employeeName,
      Department: w.department,
      Score: w.score,
      Indicator: w.indicator,
      AttendanceRate: `${w.attendancePercentage}%`,
      AbsenceCount: w.absenceCount,
      Trend: w.trend,
      LeavePattern: w.leavePattern,
    }));
    exportToCSV(dataToExport, 'Company_Wellness_Monitor_Report.csv');
    success('Exported wellness matrix report to CSV');
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
      header: 'Attendance %',
      accessor: 'attendancePercentage',
      render: (val) => <strong>{val}%</strong>,
    },
    {
      header: 'Absence Count',
      accessor: 'absenceCount',
      render: (val) => <span>{val} {val === 1 ? 'day' : 'days'}</span>,
    },
    {
      header: 'Work Pattern',
      accessor: 'leavePattern',
      render: (val) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', maxWidth: '240px', display: 'inline-block' }} className="truncate">
          {val}
        </span>
      ),
    },
    {
      header: 'Score',
      accessor: 'score',
      render: (val) => <strong style={{ fontSize: '0.9375rem', color: 'var(--slate-900)' }}>{val}/100</strong>,
    },
    {
      header: 'Indicator Tier',
      accessor: 'indicator',
      render: (val) => (
        <Badge variant={val}>
          {val === 'stable' ? '🟢 Stable' : val === 'monitor' ? '🟡 Monitor' : '🔴 Needs Attention'}
        </Badge>
      ),
    },
    {
      header: '30d Trend',
      accessor: 'trend',
      render: (val) => (
        <span
          style={{
            fontWeight: 700,
            fontSize: '0.8125rem',
            color: val?.includes('-') ? 'var(--danger-600)' : 'var(--success-600)',
          }}
        >
          {val}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Workforce Wellness & Availability Monitor"
        subtitle="Objective company-wide workforce regularity matrix derived strictly from attendance trends and absence signals."
        breadcrumbs={['HR Operations', 'Wellness Monitor']}
        actions={
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>
            Export Wellness CSV
          </Button>
        }
      />

      {/* Compliance Disclaimer Banner */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--info-50)',
          borderColor: 'var(--info-100)',
          marginBottom: '1.75rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <Info size={18} className="text-info" style={{ shrink: 0 }} />
        <span style={{ fontSize: '0.8125rem', color: 'var(--info-700)', lineHeight: '1.4' }}>
          <strong>Compliance Protocol:</strong> {WELLNESS_DISCLAIMER}
        </span>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search employee name or department..."
          />

          <FilterBar
            filters={[
              {
                key: 'indicator',
                label: 'Status Level',
                options: [
                  { label: '🟢 Stable', value: 'stable' },
                  { label: '🟡 Monitor', value: 'monitor' },
                  { label: '🔴 Needs Attention', value: 'needs_attention' },
                ],
              },
              {
                key: 'department',
                label: 'Department',
                options: DEPARTMENTS.map((d) => ({ label: d, value: d })),
              },
            ]}
            values={{ indicator: indicatorFilter, department: deptFilter }}
            onChange={(key, val) => {
              if (key === 'indicator') setIndicatorFilter(val);
              if (key === 'department') setDeptFilter(val);
            }}
            onReset={() => {
              setIndicatorFilter('all');
              setDeptFilter('all');
              setSearch('');
            }}
          />
        </div>

        <DataTable
          columns={columns}
          data={wellnessList}
          loading={loading}
          onRowClick={(row) => setSelectedEmpWellness(row)}
          actions={(row) => (
            <Button
              variant="ghost"
              size="sm"
              icon={Eye}
              onClick={() => setSelectedEmpWellness(row)}
            >
              Analyze
            </Button>
          )}
        />
      </div>

      {/* Drill-down Detail Modal */}
      <Modal
        isOpen={!!selectedEmpWellness}
        onClose={() => setSelectedEmpWellness(null)}
        title={`Workforce Regularity Insight: ${selectedEmpWellness?.employeeName}`}
        subtitle={`Department: ${selectedEmpWellness?.department} (${selectedEmpWellness?.employeeId})`}
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setSelectedEmpWellness(null)}>
            Close Insight
          </Button>
        }
      >
        {selectedEmpWellness && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <WellnessScore
                score={selectedEmpWellness.score}
                indicator={selectedEmpWellness.indicator}
                size="lg"
              />
            </div>

            <WellnessExplanation
              attendancePercentage={selectedEmpWellness.attendancePercentage}
              absenceCount={selectedEmpWellness.absenceCount}
              leavePattern={selectedEmpWellness.leavePattern}
              trend={selectedEmpWellness.trend}
              explanation={selectedEmpWellness.explanation}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WellnessMonitor;
