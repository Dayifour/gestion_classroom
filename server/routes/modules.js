import express from "express";
import { body, validationResult } from "express-validator";
import db from "../config/database.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
const router = express.Router();

// Get all modules
router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT m.*, 
             u.firstName as teacherFirstName, u.lastName as teacherLastName,
             COUNT(DISTINCT ms.studentId) as studentCount,
             COUNT(DISTINCT p.id) as projectCount
      FROM modules m
      LEFT JOIN users u ON m.teacherId = u.id
      LEFT JOIN module_students ms ON m.id = ms.moduleId
      LEFT JOIN projects p ON m.id = p.moduleId
    `;

    const params = [];

    if (req.user.role === "student" || req.user.role === "coordinator") {
      query +=
        " WHERE m.id IN (SELECT moduleId FROM module_students WHERE studentId = ?)";
      params.push(req.user.id);
    } else if (req.user.role === "teacher") {
      query += " WHERE m.teacherId = ?";
      params.push(req.user.id);
    }

    query += " GROUP BY m.id ORDER BY m.createdAt DESC";

    const [modules] = await db.execute(query, params);

    res.json(modules);
  } catch (error) {
    console.error("Get modules error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create module (teachers only)
router.post(
  "/",
  authenticateToken,
  requireRole(["teacher"]),
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Module name must be at least 2 characters"),
    body("description").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description } = req.body;

      const [result] = await db.execute(
        "INSERT INTO modules (name, description, teacherId) VALUES (?, ?, ?)",
        [name, description || "", req.user.id]
      );

      // Get created module with teacher info
      const [modules] = await db.execute(
        `
      SELECT m.*, u.firstName as teacherFirstName, u.lastName as teacherLastName
      FROM modules m
      LEFT JOIN users u ON m.teacherId = u.id
      WHERE m.id = ?
    `,
        [result.insertId]
      );

      res.status(201).json({
        message: "Module created successfully",
        module: modules[0],
      });
    } catch (error) {
      console.error("Create module error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get module by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const [modules] = await db.execute(
      `
      SELECT m.*, u.firstName as teacherFirstName, u.lastName as teacherLastName
      FROM modules m
      LEFT JOIN users u ON m.teacherId = u.id
      WHERE m.id = ?
    `,
      [req.params.id]
    );

    if (modules.length === 0) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Get students in this module
    const [students] = await db.execute(
      `
      SELECT u.id, u.firstName, u.lastName, u.email, u.role
      FROM users u
      INNER JOIN module_students ms ON u.id = ms.studentId
      WHERE ms.moduleId = ?
      ORDER BY u.firstName, u.lastName
    `,
      [req.params.id]
    );

    const module = { ...modules[0], students };
    res.json(module);
  } catch (error) {
    console.error("Get module error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add student to module (teachers only)
router.post(
  "/:id/students",
  authenticateToken,
  requireRole(["teacher"]),
  [body("studentId").isInt().withMessage("Valid student ID is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { studentId } = req.body;
      const moduleId = req.params.id;

      // Check if module exists and belongs to teacher
      const [modules] = await db.execute(
        "SELECT id FROM modules WHERE id = ? AND teacherId = ?",
        [moduleId, req.user.id]
      );

      if (modules.length === 0) {
        return res
          .status(404)
          .json({ message: "Module not found or access denied" });
      }

      // Check if student exists
      const [students] = await db.execute(
        'SELECT id FROM users WHERE id = ? AND role IN ("student", "coordinator")',
        [studentId]
      );

      if (students.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Add student to module (ignore if already exists)
      await db.execute(
        "INSERT IGNORE INTO module_students (moduleId, studentId) VALUES (?, ?)",
        [moduleId, studentId]
      );

      res.json({ message: "Student added to module successfully" });
    } catch (error) {
      console.error("Add student to module error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
