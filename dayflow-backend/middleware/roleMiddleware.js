/**
 * Role-based access control middleware
 */

/**
 * Ensures user has HR role
 */
function requireHR(req, res, next) {
  if (!req.user || req.user.role !== 'HR') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Access restricted to HR administrators only.'
    });
  }
  next();
}

/**
 * Ensures user is either HR or accessing their own employee record
 * @param {string} [employeeIdParam='id'] - The req.params key containing employee ID
 */
function requireSelfOrHR(employeeIdParam = 'id') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role === 'HR') {
      return next();
    }

    const requestedEmpId = parseInt(req.params[employeeIdParam] || req.params.employeeId, 10);
    if (req.employee && req.employee.id === requestedEmpId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden. You cannot access or modify other employees\' records.'
    });
  };
}

/**
 * Ensures user has one of the allowed roles
 * @param {...string} roles 
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Requires one of the following roles: ${roles.join(', ')}.`
      });
    }
    next();
  };
}

module.exports = {
  requireHR,
  requireSelfOrHR,
  requireRole
};
