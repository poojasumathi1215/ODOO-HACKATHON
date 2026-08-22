const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/tasks
router.get('/', taskController.getTasks);

// POST /api/tasks
router.post('/', taskController.createTask);

// PATCH /api/tasks/:id/status
router.patch('/:id/status', taskController.updateTaskStatus);

// DELETE /api/tasks/:id
router.delete('/:id', taskController.deleteTask);

module.exports = router;
