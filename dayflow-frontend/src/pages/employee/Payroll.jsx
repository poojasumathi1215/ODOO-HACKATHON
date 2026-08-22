import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Download,
  Eye,
  FileText,
  CreditCard,
  ShieldCheck,
  Printer,
  X,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/tables/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import payrollApi from '../../api/payrollApi';
import { formatCurrency } from '../../utils/formatters';
import { exportToCSV, triggerPrint } from '../../utils/exportUtils';

export const Payroll = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await payrollApi.getMyPayroll();
      setPayrolls(res.data || []);
    } catch (err) {
      error('Failed to load payroll history');
    } finally {
      setLoading(false);
    }
  };

  const currentPay = payrolls[0] || {
    basicSalary: 9500,
    allowances: 1200,
    bonus: 800,
    overtime: 350,
    deductions: 600,
    netSalary: 11250,
    month: 'July',
    year: 2026,
    status: 'paid',
  };

  const handleDownloadPayslip = (payslip) => {
    const exportData = [
      {
        EmployeeID: user?.employeeId || 'DF-101',
        EmployeeName: user?.name || 'Sarah Jenkins',
        PayPeriod: `${payslip.month} ${payslip.year}`,
        BasicSalary: payslip.basicSalary,
        Allowances: payslip.allowances,
        Bonus: payslip.bonus,
        Overtime: payslip.overtime,
        Deductions: payslip.deductions,
        NetSalary: payslip.netSalary,
        Status: payslip.status,
      },
    ];
    exportToCSV(exportData, `Payslip_${payslip.month}_${payslip.year}.csv`);
    success(`Payslip for ${payslip.month} ${payslip.year} downloaded.`);
  };

  const columns = [
    {
      header: 'Pay Period',
      accessor: 'month',
      render: (_, row) => (
        <span style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
          {row.month} {row.year}
        </span>
      ),
    },
    {
      header: 'Gross Earnings',
      accessor: 'basicSalary',
      render: (_, row) => (
        <span>{formatCurrency(Number(row.basicSalary || 0) + Number(row.allowances || 0) + Number(row.bonus || 0) + Number(row.overtime || 0))}</span>
      ),
    },
    {
      header: 'Deductions (Tax, PF)',
      accessor: 'deductions',
      render: (val) => <span style={{ color: 'var(--danger-600)' }}>-{formatCurrency(val)}</span>,
    },
    {
      header: 'Net Disbursed Salary',
      accessor: 'netSalary',
      render: (val) => <strong style={{ color: 'var(--slate-900)', fontSize: '0.9375rem' }}>{formatCurrency(val)}</strong>,
    },
    {
      header: 'Disbursement Status',
      accessor: 'status',
      render: (val) => <Badge variant={val}>{val.toUpperCase()}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Compensation & Payslips"
        subtitle="Review your monthly salary statements, itemized allowances, and tax deductions."
        breadcrumbs={['Workspace', 'Payroll']}
      />

      {/* Net Salary Highlight Card */}
      <div
        className="card"
        style={{
          padding: '2rem',
          marginBottom: '1.75rem',
          background: 'linear-gradient(135deg, var(--slate-900) 0%, var(--slate-800) 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.625rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              <ShieldCheck size={14} style={{ color: '#4ade80' }} />
              <span>Verified Disbursed Compensation</span>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {formatCurrency(currentPay.netSalary)}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-400)', marginTop: '0.5rem' }}>
              Net take-home for {currentPay.month} {currentPay.year} • Processed to Account •••• 4892
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              size="sm"
              icon={Eye}
              onClick={() => setSelectedPayslip(currentPay)}
              style={{ backgroundColor: '#ffffff', color: 'var(--slate-900)' }}
            >
              View Detailed Payslip
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={() => handleDownloadPayslip(currentPay)}
            >
              Download PDF / CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Itemized Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>BASIC SALARY</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            {formatCurrency(currentPay.basicSalary)}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>ALLOWANCES (HRA, FLEX)</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            {formatCurrency(currentPay.allowances)}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>PERFORMANCE BONUS</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            {formatCurrency(currentPay.bonus)}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>OVERTIME LOG</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            {formatCurrency(currentPay.overtime)}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>DEDUCTIONS & TAX</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger-600)', marginTop: '0.25rem' }}>
            -{formatCurrency(currentPay.deductions)}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Disbursement History
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              Past monthly compensation statements
            </span>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={payrolls}
          loading={loading}
          actions={(row) => (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" icon={Eye} onClick={() => setSelectedPayslip(row)}>
                View
              </Button>
              <Button variant="secondary" size="sm" icon={Download} onClick={() => handleDownloadPayslip(row)}>
                Export
              </Button>
            </div>
          )}
        />
      </div>

      {/* Detailed Printable Payslip Modal */}
      <Modal
        isOpen={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        title={`Payslip – ${selectedPayslip?.month} ${selectedPayslip?.year}`}
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              Official DayFlow HRMS Disbursal Record
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="secondary" size="sm" icon={Printer} onClick={triggerPrint}>
                Print Payslip
              </Button>
              <Button variant="primary" size="sm" icon={Download} onClick={() => handleDownloadPayslip(selectedPayslip)}>
                Download Copy
              </Button>
            </div>
          </div>
        }
      >
        {selectedPayslip && (
          <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
            {/* Payslip Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--slate-900)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>DayFlow Inc.</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>500 Silicon Ave, Palo Alto, CA</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Tax ID: US-8921-9842</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success">PAID</span>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                  Pay Period: {selectedPayslip.month} {selectedPayslip.year}
                </div>
              </div>
            </div>

            {/* Employee Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.8125rem' }}>
              <div>
                <div><strong>Employee Name:</strong> {user?.name || 'Sarah Jenkins'}</div>
                <div><strong>Employee ID:</strong> {user?.employeeId || 'DF-101'}</div>
                <div><strong>Designation:</strong> {user?.designation || 'Senior Staff Engineer'}</div>
              </div>
              <div>
                <div><strong>Department:</strong> {user?.department || 'Engineering'}</div>
                <div><strong>Bank Name:</strong> Silicon Valley Tech Bank</div>
                <div><strong>Account:</strong> •••••••• 4892</div>
              </div>
            </div>

            {/* Earnings & Deductions Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.375rem', marginBottom: '0.5rem' }}>
                  Earnings
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  <span>Basic Salary</span>
                  <span>{formatCurrency(selectedPayslip.basicSalary)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  <span>Allowances</span>
                  <span>{formatCurrency(selectedPayslip.allowances)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  <span>Bonus</span>
                  <span>{formatCurrency(selectedPayslip.bonus)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  <span>Overtime</span>
                  <span>{formatCurrency(selectedPayslip.overtime)}</span>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.375rem', marginBottom: '0.5rem' }}>
                  Deductions
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  <span>Income Tax Withholding</span>
                  <span>{formatCurrency(selectedPayslip.deductions * 0.7)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  <span>Provident Fund / 401(k)</span>
                  <span>{formatCurrency(selectedPayslip.deductions * 0.3)}</span>
                </div>
              </div>
            </div>

            {/* Total Net Payout */}
            <div
              style={{
                backgroundColor: 'var(--slate-100)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Net Disbursed Amount
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                {formatCurrency(selectedPayslip.netSalary)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payroll;
