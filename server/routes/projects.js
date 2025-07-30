const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all projects
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT p.*, m.name as moduleName, m.teacherId,
             u.firstName as teacherFirstName, u.lastName as teacherLastName
      FROM projects p
      LEFT JOIN modules m ON p.moduleId = m.id
      LEFT JOIN users u ON m.teacherId = u.id
    `;
    
    const params = [];
    
    if (req.user.role === 'student' || req.user.role === 'coordinator') {
      query += ` WHERE m.id IN (SELECT moduleId FROM module_students WHERE studentId = ?)`;
      params.push(req.user.id);
    } else if (req.user.role === 'teacher') {
      query += ` WHERE m.teacherId = ?`;
      params.push(req.user.id);
    }
    
    query += ' ORDER BY p.createdAt DESC';

    const [projects] = await db.execute(query, params);
    
    // Get steps for each project
    for (let project of projects) {
      const [steps] = await db.execute(
        'SELECT * FROM project_steps WHERE projectId = ? ORDER BY stepOrder',
        [project.id]
      );
      project.steps = steps;
    }
    
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project (teachers only)
router.post('/', authenticateToken, requireRole(['teacher']), [
  body('title').trim().isLength({ min: 2 }).withMessage('Project title must be at least 2 characters'),
  body('description').optional().trim(),
  body('moduleId').isInt().withMessage('Valid module ID is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('steps').isArray({ min: 1 }).withMessage('At least one step is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, moduleId, dueDate, steps } = req.body;

    // Check if module exists and belongs to teacher
    const [modules] = await db.execute(
      'SELECT id FROM modules WHERE id = ? AND teacherId = ?',
      [moduleId, req.user.id]
    );

    if (modules.length === 0) {
      return res.status(404).json({ message: 'Module not found or access denied' });
    }

    // Create project
    const [result] = await db.execute(
      'INSERT INTO projects (title, description, moduleId, dueDate, status) VALUES (?, ?, ?, ?, ?)',
      [title, description || '', moduleId, dueDate, 'active']
    );

    const projectId = result.insertId;

    // Create project steps
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      await db.execute(
        'INSERT INTO project_steps (title, description, projectId, stepOrder) VALUES (?, ?, ?, ?)',
        [step.title, step.description || '', projectId, i + 1]
      );
    }

    res.status(201).json({
      message: 'Project created successfully',
      projectId
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [projects] = await db.execute(`
      SELECT p.*, m.name as moduleName, m.teacherId,
             u.firstName as teacherFirstName, u.lastName as teacherLastName
      FROM projects p
      LEFT JOIN modules m ON p.moduleId = m.id
      LEFT JOIN users u ON m.teacherId = u.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get project steps
    const [steps] = await db.execute(
      'SELECT * FROM project_steps WHERE projectId = ? ORDER BY stepOrder',
      [req.params.id]
    );

    const project = { ...projects[0], steps };
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;