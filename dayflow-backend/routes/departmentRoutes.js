const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireHR } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// GET /api/departments
router.get('/', departmentController.getDepartments);

// POST /api/departments (HR only)
router.post('/', requireHR, departmentController.createDepartment);

// GET /api/departments/teams
router.get('/teams', departmentController.getTeams);

// POST /api/departments/teams (HR only)
router.post('/teams', requireHR, departmentController.createTeam);

module.exports = router;
