import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  PlusCircle,
  Download,
  Edit2,
  Eye,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/tables/DataTable';
import FilterBar from '../../components/tables/FilterBar';
import SearchBar from '../../components/tables/SearchBar';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import PayrollForm from '../../components/forms/PayrollForm';
import { useToast } from '../../hooks/useToast';
import payrollApi from '../../api/payrollApi';
import employeeApi from '../../api/employeeApi';
import { formatCurrency } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import { mockEmployees } from '../../utils/mockData';

export const Payroll = () => {
  const { success, error } = useToast();

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState(mockEmployees);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchPayroll();
  }, [search, monthFilter]);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const [payRes, empRes] = await Promise.all([
        payrollApi.getAllPayroll({ search, month: monthFilter !== 'all' ? monthFilter : undefined }),
        employeeApi.getAll(),
      ]);
      setPayrolls(payRes.data || []);
      if (empRes.data) setEmployees(empRes.data);
    } catch (err) {
      error('Failed to load payroll directory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    setFormLoading(true);
    try {
      if (editingRecord) {
        await payrollApi.update(editingRecord.id, formData);
        success('Payroll record updated successfully');
      } else {
        await payrollApi.create(formData);
        success('Payroll record generated successfully');
      }
      setIsModalOpen(false);
      setEditingRecord(null);
      fetchPayroll();
    } catch (err) {
      error('Failed to save payroll record');
    } finally {
      setFormLoading(false);
    }
  };

  const handleExport = () => {
    const dataToExport = payrolls.map((p) => ({
      PayrollID: p.id,
      EmployeeID: p.employeeId,
      EmployeeName: p.employeeName,
      Department: p.department,
      Month: p.month,
      Year: p.year,
      BasicSalary: p.basicSalary,
      Allowances: p.allowances,
      Bonus: p.bonus,
      Overtime: p.overtime,
      Deductions: p.deductions,
      NetSalary: p.netSalary,
      Status: p.status,
    }));
    exportToCSV(dataToExport, 'Company_Payroll_Register.csv');
    success('Exported payroll register to CSV');
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
      header: 'Period',
      accessor: 'month',
      render: (_, row) => <span>{row.month} {row.year}</span>,
    },
    {
      header: 'Basic Pay',
      accessor: 'basicSalary',
      render: (val) => formatCurrency(val),
    },
    {
      header: 'Allowances & OT',
      accessor: 'allowances',
      render: (_, row) => (
        <span style={{ color: 'var(--success-700)' }}>
          +{formatCurrency(Number(row.allowances || 0) + Number(row.bonus || 0) + Number(row.overtime || 0))}
        </span>
      ),
    },
    {
      header: 'Deductions (Tax)',
      accessor: 'deductions',
      render: (val) => <span style={{ color: 'var(--danger-600)' }}>-{formatCurrency(val)}</span>,
    },
    {
      header: 'Net Disbursed',
      accessor: 'netSalary',
      render: (val) => <strong style={{ color: 'var(--slate-900)', fontSize: '0.9375rem' }}>{formatCurrency(val)}</strong>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => <Badge variant={val}>{val?.toUpperCase()}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payroll & Compensation Management"
        subtitle="Generate monthly payroll disbursements, adjust individual components, and audit company payout totals."
        breadcrumbs={['HR Operations', 'Payroll']}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>
              Export Register
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => {
                setEditingRecord(null);
                setIsModalOpen(true);
              }}
            >
              Generate Payroll
            </Button>
          </div>
        }
      />

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
                key: 'month',
                label: 'Month',
                options: months.map((m) => ({ label: m, value: m })),
              },
            ]}
            values={{ month: monthFilter }}
            onChange={(key, val) => setMonthFilter(val)}
            onReset={() => {
              setMonthFilter('all');
              setSearch('');
            }}
          />
        </div>

        <DataTable
          columns={columns}
          data={payrolls}
          loading={loading}
          actions={(row) => (
            <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
              <Button
                variant="ghost"
                size="sm"
                icon={Edit2}
                onClick={() => {
                  setEditingRecord(row);
                  setIsModalOpen(true);
                }}
              >
                Edit
              </Button>
            </div>
          )}
        />
      </div>

      {/* Create / Edit Payroll Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? `Edit Payroll: ${editingRecord.employeeName}` : 'Generate Payroll Record'}
        subtitle="Calculate earnings, benefits, tax withholding, and net payout."
        size="lg"
      >
        <PayrollForm
          initialData={editingRecord || {}}
          employees={employees}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setIsModalOpen(false)}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default Payroll;
