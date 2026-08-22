import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  PlusCircle,
  Download,
  Eye,
  Edit2,
  UserX,
  UserCheck,
  Search,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/tables/DataTable';
import SearchBar from '../../components/tables/SearchBar';
import FilterBar from '../../components/tables/FilterBar';
import Pagination from '../../components/tables/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmployeeForm from '../../components/forms/EmployeeForm';
import { useToast } from '../../hooks/useToast';
import employeeApi from '../../api/employeeApi';
import { exportToCSV } from '../../utils/exportUtils';
import { DEPARTMENTS } from '../../utils/constants';

export const Employees = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Add / Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Status toggle confirmation
  const [toggleEmp, setToggleEmp] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [search, deptFilter, statusFilter]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeApi.getAll({
        search,
        department: deptFilter !== 'all' ? deptFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setEmployees(res.data || []);
    } catch (err) {
      error('Failed to load employee directory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    setFormLoading(true);
    try {
      if (editingEmployee) {
        await employeeApi.update(editingEmployee.id, formData);
        success('Employee record updated successfully!');
      } else {
        await employeeApi.create(formData);
        success('New employee added to workforce!');
      }
      setIsFormModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (err) {
      error(err.message || 'Failed to save employee');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleEmp) return;
    setToggleLoading(true);
    const nextStatus = toggleEmp.status === 'active' ? 'inactive' : 'active';
    try {
      await employeeApi.updateStatus(toggleEmp.id, nextStatus);
      success(`Employee marked as ${nextStatus}`);
      setToggleEmp(null);
      fetchEmployees();
    } catch (err) {
      error('Failed to change status');
    } finally {
      setToggleLoading(false);
    }
  };

  const handleExport = () => {
    const dataToExport = employees.map((e) => ({
      EmployeeID: e.employeeId,
      Name: e.name,
      Email: e.email,
      Phone: e.phone,
      Department: e.department,
      Team: e.team,
      Designation: e.designation,
      Manager: e.manager,
      Status: e.status,
      Salary: e.salary,
    }));
    exportToCSV(dataToExport, 'DayFlow_Employee_Directory.csv');
    success('Exported employee directory to CSV');
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'name',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={row.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            alt={row.name}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{row.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{row.employeeId}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Department & Team',
      accessor: 'department',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{row.department}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{row.team || 'General'}</div>
        </div>
      ),
    },
    {
      header: 'Designation',
      accessor: 'designation',
      render: (val) => <span style={{ color: 'var(--slate-700)', fontWeight: 500 }}>{val}</span>,
    },
    {
      header: 'Work Email',
      accessor: 'email',
      render: (val) => <span style={{ fontSize: '0.8125rem', color: 'var(--slate-600)' }}>{val}</span>,
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
        title="Employee Directory"
        subtitle="Comprehensive personnel master records, organizational charts, and profile administration."
        breadcrumbs={['HR Operations', 'Employees']}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => {
                setEditingEmployee(null);
                setIsFormModalOpen(true);
              }}
            >
              Add New Employee
            </Button>
          </div>
        }
      />

      <div className="card" style={{ padding: '1.5rem' }}>
        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, ID, or title..."
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
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
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

        {/* Directory Table */}
        <DataTable
          columns={columns}
          data={employees}
          loading={loading}
          onRowClick={(row) => navigate(`/hr/employees/${row.id}`)}
          actions={(row) => (
            <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
              <Button
                variant="ghost"
                size="sm"
                icon={Eye}
                title="View Full Profile"
                onClick={() => navigate(`/hr/employees/${row.id}`)}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={Edit2}
                title="Edit Employee"
                onClick={() => {
                  setEditingEmployee(row);
                  setIsFormModalOpen(true);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={row.status === 'active' ? UserX : UserCheck}
                title={row.status === 'active' ? 'Deactivate' : 'Activate'}
                style={{ color: row.status === 'active' ? 'var(--danger-600)' : 'var(--success-600)' }}
                onClick={() => setToggleEmp(row)}
              />
            </div>
          )}
        />

        <Pagination
          currentPage={currentPage}
          totalItems={employees.length}
          pageSize={10}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingEmployee ? `Edit Employee: ${editingEmployee.name}` : 'Add New Team Member'}
        subtitle="Populate official organizational information and credentials."
        size="lg"
      >
        <EmployeeForm
          initialData={editingEmployee || {}}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setIsFormModalOpen(false)}
          loading={formLoading}
        />
      </Modal>

      {/* Status Toggle Confirm */}
      <ConfirmDialog
        isOpen={!!toggleEmp}
        onClose={() => setToggleEmp(null)}
        onConfirm={handleToggleStatus}
        title={`${toggleEmp?.status === 'active' ? 'Deactivate' : 'Activate'} Employee`}
        message={`Are you sure you want to change the operational status for ${toggleEmp?.name}?`}
        confirmText={toggleEmp?.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
        variant={toggleEmp?.status === 'active' ? 'danger' : 'primary'}
        loading={toggleLoading}
      />
    </div>
  );
};

export default Employees;
