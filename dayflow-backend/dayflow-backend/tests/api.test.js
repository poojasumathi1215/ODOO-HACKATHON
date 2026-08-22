/**
 * DayFlow HRMS Backend - End-to-End Automated Integration Test Suite
 */
const http = require('http');
const app = require('../server');

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path}`);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   🧪 Starting DayFlow HRMS Backend Integration Tests');
  console.log('======================================================\n');

  server = app.listen(PORT);

  try {
    // 1. Health Check
    console.log('--- 1. Health Check ---');
    const healthRes = await request('/health');
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK');
    assert(healthRes.body.success === true, 'Health check response success is true');
    assert(healthRes.body.message === 'DayFlow API is running', 'Health check message matches specification');

    // 2. Authentication
    console.log('\n--- 2. Authentication & Authorization ---');
    // Admin Login
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@dayflow.com', password: 'Admin@123' }
    });
    assert(adminLoginRes.status === 200, 'HR Admin login successful (200)');
    assert(adminLoginRes.body.data.user.role === 'HR', 'Admin user has HR role');
    assert(!adminLoginRes.body.data.user.password, 'Password hash is NOT exposed in response');
    const adminToken = adminLoginRes.body.data.token;

    // Employee Login
    const empLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'alex.turner@dayflow.com', password: 'Employee@123' }
    });
    assert(empLoginRes.status === 200, 'Employee login successful (200)');
    assert(empLoginRes.body.data.user.role === 'Employee', 'Employee user has Employee role');
    assert(empLoginRes.body.data.employee.employee_id === 'EMP-1001', 'Employee profile correctly attached');
    const empToken = empLoginRes.body.data.token;
    const alexEmployeeId = empLoginRes.body.data.employee.id;

    // Invalid Login
    const invalidLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@dayflow.com', password: 'WrongPassword' }
    });
    assert(invalidLoginRes.status === 401, 'Invalid password correctly returns 401');

    // Auth Me
    const meRes = await request('/auth/me', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    assert(meRes.status === 200, 'GET /api/auth/me returns 200');
    assert(meRes.body.data.user.email === 'alex.turner@dayflow.com', 'Me endpoint returns correct user info');

    // 3. Employee Management & Role Protection
    console.log('\n--- 3. Employee Management ---');
    // Non-HR trying to create employee -> 403
    const empCreateForbidden = await request('/employees', {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` },
      body: { name: 'Unauthorized', email: 'test@unauth.com', employeeId: 'EMP-9999', designation: 'Tester' }
    });
    assert(empCreateForbidden.status === 403, 'Employee role blocked from creating employees (403)');

    // HR creating a new employee
    const uniqueEmail = `test.employee.${Date.now()}@dayflow.com`;
    const uniqueEmpId = `EMP-${Date.now().toString().slice(-4)}`;
    const createEmpRes = await request('/employees', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Jordan Belfort',
        email: uniqueEmail,
        password: 'Employee@123',
        employeeId: uniqueEmpId,
        designation: 'Sales Executive',
        phone: '+1 (555) 999-8888',
        joiningDate: '2026-08-01'
      }
    });
    assert(createEmpRes.status === 201, 'HR can create new employee (201)');
    assert(createEmpRes.body.data.employee_id === uniqueEmpId, 'New employee created with correct ID');
    const newEmpId = createEmpRes.body.data.id;

    // Employee List with Pagination & Search
    const empListRes = await request('/employees?search=Jordan', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(empListRes.status === 200, 'Employee search works');
    assert(empListRes.body.data.records.length > 0, 'Found newly created employee via search');

    // Patch status
    const patchStatusRes = await request(`/employees/${newEmpId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'On Leave' }
    });
    assert(patchStatusRes.status === 200, 'HR can update employee employment status (200)');
    assert(patchStatusRes.body.data.employmentStatus === 'On Leave', 'Status updated to On Leave');

    // 4. Attendance
    console.log('\n--- 4. Attendance System ---');
    // Get personal attendance
    const myAttRes = await request('/attendance/my', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    assert(myAttRes.status === 200, 'Employee can retrieve their attendance (200)');
    assert(Array.isArray(myAttRes.body.data.records), 'Attendance records returned as array');

    // Attendance Summary
    const attSumRes = await request('/attendance/summary', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(attSumRes.status === 200, 'GET /api/attendance/summary returns 200');
    assert(typeof attSumRes.body.data.totalEmployees === 'number', 'Summary contains totalEmployees count');
    assert(typeof attSumRes.body.data.attendancePercentage === 'number', 'Summary contains attendancePercentage');

    // 5. Leaves & Balances
    console.log('\n--- 5. Leave Management ---');
    // Get Balances
    const balRes = await request('/leaves/balances', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    assert(balRes.status === 200, 'Employee can retrieve leave balances (200)');
    assert(balRes.body.data.length >= 4, 'Leave balances include 4 leave types');

    // Apply for leave (guaranteed weekdays)
    // Find next Monday
    const targetMonday = new Date();
    targetMonday.setDate(targetMonday.getDate() + ((1 + 7 - targetMonday.getDay()) % 7 || 7) + 14); // 2 weeks ahead Monday
    const targetTuesday = new Date(targetMonday);
    targetTuesday.setDate(targetMonday.getDate() + 1);

    const startStr = targetMonday.toISOString().split('T')[0];
    const endStr = targetTuesday.toISOString().split('T')[0];

    const applyLeaveRes = await request('/leaves', {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` },
      body: {
        leaveType: 'Casual Leave',
        startDate: startStr,
        endDate: endStr,
        reason: 'Conference attendance and tech talk'
      }
    });
    assert(applyLeaveRes.status === 201, 'Leave application submitted successfully (201)');
    assert(applyLeaveRes.body.data && applyLeaveRes.body.data.status === 'Pending', 'New leave is in Pending state');
    const createdLeaveId = applyLeaveRes.body.data ? applyLeaveRes.body.data.id : 1;

    // Approve Leave as HR
    const approveRes = await request(`/leaves/${createdLeaveId}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(approveRes.status === 200, 'HR can approve leave request (200)');
    assert(approveRes.body.data.status === 'Approved', 'Leave status changed to Approved');

    // 6. Payroll
    console.log('\n--- 6. Payroll System ---');
    // Employee gets own payroll
    const myPayRes = await request('/payroll/my', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    assert(myPayRes.status === 200, 'Employee can view their own payroll records (200)');
    assert(myPayRes.body.data.records.length > 0, 'Payroll history returned for employee');

    // HR creates payroll
    const createPayRes = await request('/payroll', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        employeeId: newEmpId,
        basicSalary: 6000,
        allowances: 500,
        bonus: 200,
        overtime: 150,
        deductions: 300,
        payMonth: 9,
        payYear: 2026
      }
    });
    assert(createPayRes.status === 201, 'HR can create payroll (201)');
    // Formula: 6000 + 500 + 200 + 150 - 300 = 6550
    assert(createPayRes.body.data.net_salary === 6550, 'Net salary correctly calculated: basic + allow + bonus + OT - deductions');

    // 7. Wellness Indicators
    console.log('\n--- 7. Wellness Indicators ---');
    const myWellnessRes = await request('/wellness/my', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    assert(myWellnessRes.status === 200, 'GET /api/wellness/my returns 200');
    assert(typeof myWellnessRes.body.data.current.overall_score === 'number', 'Wellness overall score is numeric');
    assert(['Stable', 'Monitor', 'Needs Attention'].includes(myWellnessRes.body.data.current.indicator_level), 'Wellness level is one of Stable, Monitor, or Needs Attention');
    assert(typeof myWellnessRes.body.data.current.explanation === 'string', 'Wellness contains clear, objective explanation');

    // HR workforce wellness
    const workforceWellRes = await request('/wellness', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(workforceWellRes.status === 200, 'HR can view workforce wellness (200)');
    assert(typeof workforceWellRes.body.data.summary.stable === 'number', 'Workforce summary includes breakdown');

    // 8. Smart Alerts
    console.log('\n--- 8. Smart HR Alerts ---');
    const alertsRes = await request('/alerts', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(alertsRes.status === 200, 'HR can view smart alerts (200)');
    assert(alertsRes.body.data.records.length > 0, 'Pre-seeded smart alerts are listed');

    // Non-HR blocked
    const alertsForbidden = await request('/alerts', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    assert(alertsForbidden.status === 403, 'Employee cannot access smart alerts (403)');

    // 9. Analytics & Recharts Format
    console.log('\n--- 9. Analytics & Charts ---');
    const dashRes = await request('/analytics/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(dashRes.status === 200, 'GET /api/analytics/dashboard returns 200');
    assert(typeof dashRes.body.data.totalEmployees === 'number', 'Dashboard totalEmployees is present');
    assert(typeof dashRes.body.data.averageAttendance === 'number', 'Dashboard averageAttendance is present');

    const attChartRes = await request('/analytics/attendance', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(attChartRes.status === 200, 'GET /api/analytics/attendance returns 200');
    assert(Array.isArray(attChartRes.body.data.trend), 'Attendance trend formatted as Recharts array');

    const wellnessChartRes = await request('/analytics/wellness', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(wellnessChartRes.status === 200, 'GET /api/analytics/wellness returns 200');
    assert(Array.isArray(wellnessChartRes.body.data.levels), 'Wellness levels formatted for charts');

    // 10. Reports
    console.log('\n--- 10. Reports Export ---');
    const empRepRes = await request('/reports/employees', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(empRepRes.status === 200, 'GET /api/reports/employees returns 200');
    assert(Array.isArray(empRepRes.body.data.rows), 'Report returns tabular rows');

    const payRepRes = await request('/reports/payroll', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(payRepRes.status === 200, 'GET /api/reports/payroll returns 200');
    assert(Array.isArray(payRepRes.body.data.rows), 'Payroll report returns tabular rows');

    // 11. Notifications
    console.log('\n--- 11. Notifications ---');
    const notifRes = await request('/notifications', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    assert(notifRes.status === 200, 'GET /api/notifications returns 200');
    assert(Array.isArray(notifRes.body.data.notifications), 'Notifications array returned');

    // Mark all read
    const markAllRes = await request('/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${empToken}` }
    });
    assert(markAllRes.status === 200, 'PUT /api/notifications/read-all returns 200');

    // 12. Holidays & Tasks
    console.log('\n--- 12. Holidays & Tasks ---');
    const holRes = await request('/holidays?year=2026', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    assert(holRes.status === 200, 'GET /api/holidays returns 200');
    assert(holRes.body.data.length > 0, 'Holidays list is populated');

    const taskRes = await request('/tasks', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(taskRes.status === 200, 'GET /api/tasks returns 200');
    assert(Array.isArray(taskRes.body.data), 'Tasks array returned');

    console.log('\n======================================================');
    console.log(`   🏁 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

  } catch (error) {
    console.error('Test Suite Fatal Error:', error);
    failed++;
  } finally {
    if (server) server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
