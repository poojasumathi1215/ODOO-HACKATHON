const { db } = require('../database/database');
const { logAudit } = require('../utils/auditLogger');

/**
 * Get tasks list
 */
function getTasks(req, res, next) {
  try {
    const { status, priority, assignedTo } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT t.*, u.name as assigned_to_name, c.name as created_by_name
      FROM tasks t
      JOIN users u ON t.assigned_to = u.id
      JOIN users c ON t.created_by = c.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role !== 'HR') {
      query += ' AND (t.assigned_to = ? OR t.created_by = ?)';
      params.push(userId, userId);
    } else if (assignedTo) {
      query += ' AND t.assigned_to = ?';
      params.push(assignedTo);
    }

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    query += " ORDER BY CASE t.priority WHEN 'Urgent' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, t.due_date ASC";

    const tasks = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      message: 'Tasks retrieved',
      data: tasks
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new task
 */
function createTask(req, res, next) {
  try {
    const { title, description, assignedTo, priority = 'Medium', dueDate } = req.body;
    if (!title || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Task title and assigned user ID are required.'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, assigned_to, priority, due_date, status, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, 'Pending', ?, DATETIME('now'))
    `);
    const resRow = stmt.run(title.trim(), description || null, assignedTo, priority, dueDate || null, req.user.id);
    const taskId = resRow.lastInsertRowid;

    // Send Notification to assigned user
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
      VALUES (?, ?, ?, 'General', 0, DATETIME('now'))
    `).run(assignedTo, 'New Task Assigned', `You have been assigned task: "${title}".`);

    logAudit(req.user.id, 'TASK_CREATE', 'TASK', taskId, `Created task "${title}" assigned to user ${assignedTo}`);

    const task = db.prepare(`
      SELECT t.*, u.name as assigned_to_name, c.name as created_by_name
      FROM tasks t
      JOIN users u ON t.assigned_to = u.id
      JOIN users c ON t.created_by = c.id
      WHERE t.id = ?
    `).get(taskId);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update task status
 */
function updateTaskStatus(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const allowed = ['Pending', 'In Progress', 'Completed'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowed.join(', ')}`
      });
    }

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Permission: HR or assigned user or creator
    if (req.user.role !== 'HR' && task.assigned_to !== req.user.id && task.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to update this task.'
      });
    }

    db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, taskId);

    const updated = db.prepare(`
      SELECT t.*, u.name as assigned_to_name, c.name as created_by_name
      FROM tasks t
      JOIN users u ON t.assigned_to = u.id
      JOIN users c ON t.created_by = c.id
      WHERE t.id = ?
    `).get(taskId);

    return res.status(200).json({
      success: true,
      message: `Task marked as ${status}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete task
 */
function deleteTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (req.user.role !== 'HR' && task.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only HR or task creator can delete tasks.'
      });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTaskStatus,
  deleteTask
};
