export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validateRequired = (value, fieldName = 'This field') => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateDateRange = (startDate, endDate) => {
  if (!startDate) return 'Start date is required';
  if (!endDate) return 'End date is required';
  if (new Date(startDate) > new Date(endDate)) {
    return 'End date cannot be earlier than start date';
  }
  return null;
};
