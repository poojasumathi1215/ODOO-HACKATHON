const bcrypt = require('bcryptjs');

/**
 * Seeds the database with rich demo data
 * @param {import('better-sqlite3').Database} db 
 */
function seedData(db) {
  console.log('[Seed] Starting database seed...');

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, 1, ?, ?)
  `);

  const insertDept = db.prepare(`
    INSERT INTO departments (name, description, created_at)
    VALUES (?, ?, ?)
  `);

  const insertTeam = db.prepare(`
    INSERT INTO teams (department_id, name, manager_id, created_at)
    VALUES (?, ?, ?, ?)
  `);

  const insertEmp = db.prepare(`
    INSERT INTO employees (user_id, employee_id, phone, department_id, team_id, designation, manager_id, joining_date, address, profile_image, employment_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLeaveBal = db.prepare(`
    INSERT INTO leave_balances (employee_id, leave_type, total_days, used_days, remaining_days, year, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAttendance = db.prepare(`
    INSERT INTO attendance (employee_id, date, check_in, check_out, working_hours, status, late_minutes, overtime_hours, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLeave = db.prepare(`
    INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status, reviewed_by, reviewed_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPayroll = db.prepare(`
    INSERT INTO payroll (employee_id, basic_salary, allowances, bonus, overtime, deductions, net_salary, pay_month, pay_year, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertNotification = db.prepare(`
    INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertWellness = db.prepare(`
    INSERT INTO wellness_indicators (employee_id, attendance_score, absence_score, leave_pattern_score, trend_score, overall_score, indicator_level, explanation, calculated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAlert = db.prepare(`
    INSERT INTO smart_alerts (employee_id, alert_type, title, message, severity, is_resolved, resolved_by, resolved_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertHoliday = db.prepare(`
    INSERT INTO holidays (name, date, description, created_at)
    VALUES (?, ?, ?, ?)
  `);

  const insertTask = db.prepare(`
    INSERT INTO tasks (title, description, assigned_to, priority, due_date, status, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  const past30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Run in a single fast transaction
  const seedTransaction = db.transaction(() => {
    // 1. Password hashes
    const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);
    const empPasswordHash = bcrypt.hashSync('Employee@123', 10);

    // 2. HR Admin User
    const adminUser = insertUser.run('DayFlow Admin', 'admin@dayflow.com', adminPasswordHash, 'HR', past30Days, past30Days);
    const adminId = adminUser.lastInsertRowid;

    // 3. Departments
    const engDept = insertDept.run('Engineering', 'Software engineering, QA, and platform infrastructure', past30Days);
    const hrDept = insertDept.run('Human Resources', 'People operations, talent acquisition, and employee relations', past30Days);
    const mktDept = insertDept.run('Marketing', 'Brand marketing, digital acquisition, and communications', past30Days);
    const prodDept = insertDept.run('Product Management', 'Product discovery, roadmap planning, and UI/UX design', past30Days);
    const finDept = insertDept.run('Finance & Operations', 'Financial reporting, accounting, and compliance', past30Days);

    // 4. Teams
    const beTeam = insertTeam.run(engDept.lastInsertRowid, 'Backend Infrastructure', adminId, past30Days);
    const feTeam = insertTeam.run(engDept.lastInsertRowid, 'Frontend & Mobile', adminId, past30Days);
    const hrTeam = insertTeam.run(hrDept.lastInsertRowid, 'People Operations', adminId, past30Days);
    const mktTeam = insertTeam.run(mktDept.lastInsertRowid, 'Growth & Content', adminId, past30Days);

    // 5. Employees Data
    const rawEmployees = [
      {
        name: 'Alex Turner',
        email: 'alex.turner@dayflow.com',
        empId: 'EMP-1001',
        phone: '+1 (555) 234-5678',
        deptId: engDept.lastInsertRowid,
        teamId: beTeam.lastInsertRowid,
        designation: 'Senior Backend Engineer',
        joiningDate: '2024-01-15',
        address: '742 Evergreen Terrace, Springfield, OR',
        status: 'Active',
        basicSalary: 8500,
        allowances: 1200,
        wellnessScore: 92,
        wellnessLevel: 'Stable',
        explanation: 'Consistent attendance rate of 96% over the last 30 days with zero unexcused absences and regular check-in schedules.'
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@dayflow.com',
        empId: 'EMP-1002',
        phone: '+1 (555) 345-6789',
        deptId: engDept.lastInsertRowid,
        teamId: feTeam.lastInsertRowid,
        designation: 'Lead Frontend Architect',
        joiningDate: '2023-08-01',
        address: '10880 Wilshire Blvd, Los Angeles, CA',
        status: 'Active',
        basicSalary: 9200,
        allowances: 1500,
        wellnessScore: 88,
        wellnessLevel: 'Stable',
        explanation: 'High attendance compliance (94%) with balanced leave utilization and reliable working hours.'
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@dayflow.com',
        empId: 'EMP-1003',
        phone: '+1 (555) 456-7890',
        deptId: prodDept.lastInsertRowid,
        teamId: beTeam.lastInsertRowid,
        designation: 'Senior Product Designer',
        joiningDate: '2024-03-10',
        address: '450 West 33rd St, New York, NY',
        status: 'Active',
        basicSalary: 7800,
        allowances: 1000,
        wellnessScore: 72,
        wellnessLevel: 'Monitor',
        explanation: 'Attendance declined slightly from 92% to 80% over the last 14 days with 3 late arrivals logged.'
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@dayflow.com',
        empId: 'EMP-1004',
        phone: '+1 (555) 567-8901',
        deptId: hrDept.lastInsertRowid,
        teamId: hrTeam.lastInsertRowid,
        designation: 'HR Business Partner',
        joiningDate: '2023-11-20',
        address: '2201 Westlake Ave, Seattle, WA',
        status: 'Active',
        basicSalary: 7000,
        allowances: 900,
        wellnessScore: 95,
        wellnessLevel: 'Stable',
        explanation: 'Exemplary attendance record (98%) with prompt daily check-in habits and well-planned time off.'
      },
      {
        name: 'David Miller',
        email: 'david.miller@dayflow.com',
        empId: 'EMP-1005',
        phone: '+1 (555) 678-9012',
        deptId: mktDept.lastInsertRowid,
        teamId: mktTeam.lastInsertRowid,
        designation: 'Growth Marketing Manager',
        joiningDate: '2024-05-02',
        address: '350 5th Ave, New York, NY',
        status: 'Active',
        basicSalary: 6800,
        allowances: 800,
        wellnessScore: 54,
        wellnessLevel: 'Needs Attention',
        explanation: 'Attendance dropped from 90% to 68% with 2 unscheduled absences and repeated late arrivals in the past 14 days.'
      },
      {
        name: 'Emily Watson',
        email: 'emily.watson@dayflow.com',
        empId: 'EMP-1006',
        phone: '+1 (555) 789-0123',
        deptId: engDept.lastInsertRowid,
        teamId: beTeam.lastInsertRowid,
        designation: 'DevOps & Site Reliability Engineer',
        joiningDate: '2024-02-18',
        address: '100 Winchester Circle, Los Gatos, CA',
        status: 'Active',
        basicSalary: 8800,
        allowances: 1300,
        wellnessScore: 84,
        wellnessLevel: 'Stable',
        explanation: 'Steady attendance performance with regular 8+ hour workdays and low absence frequency.'
      }
    ];

    const currentYear = new Date().getFullYear();
    const leaveTypes = ['Casual Leave', 'Sick Leave', 'Annual Leave', 'Emergency Leave'];

    const employeeRecords = [];

    rawEmployees.forEach((emp, index) => {
      // Create user
      const userRes = insertUser.run(emp.name, emp.email, empPasswordHash, 'Employee', past30Days, past30Days);
      const userId = userRes.lastInsertRowid;

      // Create employee
      const empRes = insertEmp.run(
        userId,
        emp.empId,
        emp.phone,
        emp.deptId,
        emp.teamId,
        emp.designation,
        adminId,
        emp.joiningDate,
        emp.address,
        `https://images.unsplash.com/photo-${1534528741775 + index * 1000}?w=150&auto=format&fit=crop&q=80`,
        emp.status,
        past30Days,
        past30Days
      );
      const employeeId = empRes.lastInsertRowid;

      employeeRecords.push({
        ...emp,
        userId,
        id: employeeId
      });

      // Leave Balances for 2026
      leaveTypes.forEach(lt => {
        const total = lt === 'Annual Leave' ? 18 : lt === 'Casual Leave' ? 12 : lt === 'Sick Leave' ? 10 : 5;
        const used = index === 4 && lt === 'Casual Leave' ? 4 : (index % 2 === 0 ? 2 : 1);
        insertLeaveBal.run(employeeId, lt, total, used, total - used, currentYear, past30Days, past30Days);
      });

      // Wellness Indicator
      const attScore = emp.wellnessLevel === 'Stable' ? 95 : emp.wellnessLevel === 'Monitor' ? 75 : 55;
      const absScore = emp.wellnessLevel === 'Stable' ? 95 : emp.wellnessLevel === 'Monitor' ? 70 : 45;
      const lpScore = emp.wellnessLevel === 'Stable' ? 90 : emp.wellnessLevel === 'Monitor' ? 75 : 60;
      const trendScore = emp.wellnessLevel === 'Stable' ? 90 : emp.wellnessLevel === 'Monitor' ? 68 : 50;

      insertWellness.run(
        employeeId,
        attScore,
        absScore,
        lpScore,
        trendScore,
        emp.wellnessScore,
        emp.wellnessLevel,
        emp.explanation,
        now
      );

      // Payroll (Current month and last 2 months)
      for (let m = 6; m <= 8; m++) {
        const bonus = m === 8 ? 500 : 0;
        const overtime = index === 0 ? 350 : 0;
        const deductions = 250;
        const net = emp.basicSalary + emp.allowances + bonus + overtime - deductions;
        const pStatus = m === 8 ? 'Processed' : 'Paid';
        insertPayroll.run(
          employeeId,
          emp.basicSalary,
          emp.allowances,
          bonus,
          overtime,
          deductions,
          net,
          m,
          currentYear,
          pStatus,
          now,
          now
        );
      }
    });

    // 6. Attendance History for all employees over the last 20 weekdays
    const today = new Date();
    for (let dayOffset = 25; dayOffset >= 0; dayOffset--) {
      const d = new Date();
      d.setDate(today.getDate() - dayOffset);
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

      const dateStr = d.toISOString().split('T')[0];

      employeeRecords.forEach((emp, empIdx) => {
        let status = 'Present';
        let checkIn = '09:00:00';
        let checkOut = '17:30:00';
        let lateMin = 0;
        let workingHours = 8.5;
        let overtime = 0.5;

        if (emp.empId === 'EMP-1005' && (dayOffset === 2 || dayOffset === 8)) {
          // David Miller absent / late pattern
          status = 'Absent';
          checkIn = null;
          checkOut = null;
          workingHours = 0;
          lateMin = 0;
          overtime = 0;
        } else if (emp.empId === 'EMP-1005' && (dayOffset === 3 || dayOffset === 4 || dayOffset === 10)) {
          status = 'Late';
          checkIn = '09:42:00';
          checkOut = '17:30:00';
          lateMin = 42;
          workingHours = 7.8;
          overtime = 0;
        } else if (emp.empId === 'EMP-1003' && dayOffset === 5) {
          status = 'Half-day';
          checkIn = '09:00:00';
          checkOut = '13:00:00';
          lateMin = 0;
          workingHours = 4.0;
          overtime = 0;
        } else if (empIdx === 1 && dayOffset === 15) {
          status = 'Leave';
          checkIn = null;
          checkOut = null;
          workingHours = 0;
          lateMin = 0;
          overtime = 0;
        }

        insertAttendance.run(
          emp.id,
          dateStr,
          checkIn ? `${dateStr}T${checkIn}Z` : null,
          checkOut ? `${dateStr}T${checkOut}Z` : null,
          workingHours,
          status,
          lateMin,
          overtime,
          `${dateStr}T09:00:00Z`,
          `${dateStr}T17:30:00Z`
        );
      });
    }

    // 7. Seed Leaves
    const alex = employeeRecords[0];
    const sarah = employeeRecords[1];
    const david = employeeRecords[4];

    // Approved Leave for Sarah
    insertLeave.run(
      sarah.id,
      'Annual Leave',
      '2026-08-01',
      '2026-08-03',
      'Annual family vacation',
      'Approved',
      adminId,
      '2026-07-28T14:30:00Z',
      '2026-07-25T10:00:00Z',
      '2026-07-28T14:30:00Z'
    );

    // Pending Leave for Alex
    insertLeave.run(
      alex.id,
      'Casual Leave',
      '2026-08-28',
      '2026-08-29',
      'Personal relocation and moving assistance',
      'Pending',
      null,
      null,
      now,
      now
    );

    // Rejected Leave for David
    insertLeave.run(
      david.id,
      'Casual Leave',
      '2026-08-10',
      '2026-08-12',
      'Short notice personal trip',
      'Rejected',
      adminId,
      '2026-08-09T16:00:00Z',
      '2026-08-08T11:00:00Z',
      '2026-08-09T16:00:00Z'
    );

    // 8. Smart HR Alerts
    insertAlert.run(
      david.id,
      'Attendance Decline',
      'Attendance Rate Dropped to 68%',
      'David Miller experienced 2 absences and 3 late check-ins in the last 14 business days, reducing wellness score to 54.',
      'High',
      0,
      null,
      null,
      now
    );

    insertAlert.run(
      employeeRecords[2].id,
      'Late Arrival Pattern',
      'Multiple Late Arrivals Detected',
      'Michael Chen has logged 3 late arrivals in the past 10 days.',
      'Medium',
      0,
      null,
      null,
      now
    );

    insertAlert.run(
      sarah.id,
      'Unusual Leave Pattern',
      'Clustered Leave Request',
      'Sarah Jenkins requested leave adjacent to weekend holidays.',
      'Low',
      1,
      adminId,
      now,
      past30Days
    );

    // 9. Notifications
    insertNotification.run(
      adminId,
      'Smart Alert: Attendance Decline',
      'High severity alert generated for David Miller (EMP-1005).',
      'Alert',
      0,
      now
    );
    insertNotification.run(
      adminId,
      'New Leave Request Submitted',
      'Alex Turner submitted a Casual Leave request for 2026-08-28 to 2026-08-29.',
      'Leave',
      0,
      now
    );
    insertNotification.run(
      sarah.userId,
      'Leave Request Approved',
      'Your Annual Leave request for 2026-08-01 to 2026-08-03 has been approved.',
      'Leave',
      1,
      now
    );
    insertNotification.run(
      david.userId,
      'Leave Request Rejected',
      'Your Casual Leave request for 2026-08-10 was rejected due to campaign milestones.',
      'Leave',
      0,
      now
    );

    // 10. Holidays
    const holidaysList = [
      { name: "New Year's Day", date: '2026-01-01', desc: 'National Holiday' },
      { name: 'Memorial Day', date: '2026-05-25', desc: 'Federal Holiday' },
      { name: 'Independence Day', date: '2026-07-04', desc: 'National Holiday' },
      { name: 'Labor Day', date: '2026-09-07', desc: 'Federal Holiday' },
      { name: 'Thanksgiving Day', date: '2026-11-26', desc: 'National Holiday' },
      { name: 'Christmas Day', date: '2026-12-25', desc: 'National Holiday' }
    ];

    holidaysList.forEach(h => {
      insertHoliday.run(h.name, h.date, h.desc, past30Days);
    });

    // 11. Tasks
    insertTask.run(
      'Review Q3 Leave Schedule',
      'Align frontend and backend team leave requests for Q3 release sprint.',
      adminId,
      'High',
      '2026-08-30',
      'In Progress',
      adminId,
      past30Days
    );

    insertTask.run(
      'Process August 2026 Payroll',
      'Verify overtime and bonus calculations for all departments before 31st.',
      adminId,
      'Urgent',
      '2026-08-31',
      'Pending',
      adminId,
      now
    );

    insertTask.run(
      'Conduct 1-on-1 with David Miller',
      'Follow up on recent attendance fluctuations and support requirements.',
      adminId,
      'Medium',
      '2026-08-27',
      'Pending',
      adminId,
      now
    );

    // 12. Audit Logs
    insertAudit.run(adminId, 'SYSTEM_INIT', 'SYSTEM', 1, 'Initial DayFlow HRMS database bootstrap and seed completed', past30Days);
    insertAudit.run(adminId, 'LEAVE_APPROVAL', 'LEAVE', 1, 'Approved Annual Leave request for Sarah Jenkins', '2026-07-28T14:30:00Z');
    insertAudit.run(adminId, 'PAYROLL_PROCESS', 'PAYROLL', 1, 'Processed July 2026 payroll batch for 6 employees', '2026-08-01T09:00:00Z');
    insertAudit.run(adminId, 'ALERT_RESOLVE', 'SMART_ALERT', 3, 'Resolved low priority leave pattern alert for Sarah Jenkins', now);

    console.log('[Seed] Database seeded successfully with 1 Admin and 6 Employees.');
  });

  seedTransaction();
}

// Allow standalone execution: node database/seed.js
if (require.main === module) {
  const { db, initDatabase } = require('./database');
  initDatabase();
  console.log('[Seed] Standalone seed run completed.');
}

module.exports = {
  seedData
};
