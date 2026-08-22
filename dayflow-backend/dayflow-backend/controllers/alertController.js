const alertService = require('../services/alertService');

/**
 * Get alerts list (HR only)
 */
function getAlerts(req, res, next) {
  try {
    const { alertType, severity, isResolved, departmentId, employeeId, page, limit } = req.query;
    const data = alertService.getAlerts({ alertType, severity, isResolved, departmentId, employeeId, page, limit });

    return res.status(200).json({
      success: true,
      message: 'Smart alerts retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get alert details by ID
 */
function getAlertById(req, res, next) {
  try {
    const alertId = parseInt(req.params.id, 10);
    const alert = alertService.getAlertById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Alert details retrieved',
      data: alert
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Resolve an alert (HR only)
 */
function resolveAlert(req, res, next) {
  try {
    const alertId = parseInt(req.params.id, 10);
    const resolved = alertService.resolveAlert(alertId, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Alert resolved successfully',
      data: resolved
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Manually trigger pattern scanner for smart alerts
 */
function scanAlerts(req, res, next) {
  try {
    const result = alertService.scanAndGenerateSmartAlerts();

    return res.status(200).json({
      success: true,
      message: 'Smart alerts scan triggered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAlerts,
  getAlertById,
  resolveAlert,
  scanAlerts
};
