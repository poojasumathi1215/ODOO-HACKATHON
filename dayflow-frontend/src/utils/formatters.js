export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (val) => {
  if (val === undefined || val === null) return '0%';
  return `${Number(val).toFixed(0)}%`;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatStatusText = (status) => {
  if (!status) return '';
  return status
    .split('_')
    .map((s) => capitalize(s))
    .join(' ');
};

export const getInitials = (name) => {
  if (!name) return 'DF';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
