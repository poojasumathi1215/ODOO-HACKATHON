export const ROLES = {
  HR: 'hr',
  EMPLOYEE: 'employee',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
  LEAVE: 'leave',
};

export const LEAVE_TYPES = {
  CASUAL: 'Casual Leave',
  SICK: 'Sick Leave',
  ANNUAL: 'Annual Leave',
  EMERGENCY: 'Emergency Leave',
};

export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

export const WELLNESS_LEVELS = {
  STABLE: 'stable',
  MONITOR: 'monitor',
  NEEDS_ATTENTION: 'needs_attention',
};

export const ALERT_SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const ALERT_STATUS = {
  OPEN: 'open',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
};

export const DEPARTMENTS = [
  'Engineering',
  'Product Design',
  'Human Resources',
  'Marketing',
  'Finance & Operations',
  'Customer Support',
  'Sales',
];

export const WELLNESS_DISCLAIMER =
  'This indicator is based only on work-related attendance and leave patterns. It does not represent a medical or mental-health diagnosis.';
