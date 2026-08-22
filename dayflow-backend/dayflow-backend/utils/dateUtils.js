/**
 * Date and Time utilities for DayFlow HRMS
 */

/**
 * Returns current date string in YYYY-MM-DD format
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
function getTodayString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates late minutes based on expected start time (09:00:00 default)
 * Grace period: 15 minutes (after 09:15 is considered late)
 * @param {string|Date} checkInTime - ISO string or Date
 * @param {string} [expectedStartTime='09:00:00']
 * @returns {number} late minutes (0 if on time)
 */
function calculateLateMinutes(checkInTime, expectedStartTime = '09:00:00') {
  if (!checkInTime) return 0;
  const inDate = new Date(checkInTime);
  const [expHours, expMinutes] = expectedStartTime.split(':').map(Number);
  
  const expectedDate = new Date(inDate);
  expectedDate.setHours(expHours, expMinutes, 0, 0);

  const diffMs = inDate.getTime() - expectedDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  return diffMinutes > 15 ? diffMinutes : 0;
}

/**
 * Calculates working hours and overtime
 * Standard day: 8.0 hours
 * @param {string|Date} checkInTime 
 * @param {string|Date} checkOutTime 
 * @returns {{ workingHours: number, overtimeHours: number, status: string }}
 */
function calculateHoursAndStatus(checkInTime, checkOutTime, lateMinutes = 0) {
  if (!checkInTime) {
    return { workingHours: 0, overtimeHours: 0, status: 'Absent' };
  }

  if (!checkOutTime) {
    const isLate = lateMinutes > 15;
    return {
      workingHours: 0,
      overtimeHours: 0,
      status: isLate ? 'Late' : 'Present'
    };
  }

  const inDate = new Date(checkInTime);
  const outDate = new Date(checkOutTime);
  const diffMs = Math.max(0, outDate.getTime() - inDate.getTime());
  const hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

  let overtime = 0;
  if (hours > 8.0) {
    overtime = parseFloat((hours - 8.0).toFixed(2));
  }

  let status = 'Present';
  if (hours < 4.5) {
    status = 'Half-day';
  } else if (lateMinutes > 15) {
    status = 'Late';
  }

  return {
    workingHours: hours,
    overtimeHours: overtime,
    status
  };
}

/**
 * Calculates total inclusive days between two dates (YYYY-MM-DD)
 * Excludes weekends (Saturday and Sunday)
 * @param {string} startDate 
 * @param {string} endDate 
 * @returns {number}
 */
function calculateWorkingDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return count;
}

/**
 * Formats a Date object to ISO string without ms
 * @param {Date} [d=new Date()]
 * @returns {string}
 */
function toLocalISOString(d = new Date()) {
  return d.toISOString();
}

module.exports = {
  getTodayString,
  calculateLateMinutes,
  calculateHoursAndStatus,
  calculateWorkingDays,
  toLocalISOString
};
