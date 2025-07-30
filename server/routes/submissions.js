import express from "express";
import { body, validationResult } from "express-validator";
import db from "../config/database.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
const router = express.Router();

// Get all submissions
router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT s.*, ps.title as stepTitle, p.title as projectTitle,
             g.name as groupName, g.coordinatorId,
             u.firstName as coordinatorFirstName, u.lastName as coordinatorLastName
      FROM submissions s
      LEFT JOIN project_steps ps ON s.stepId = ps.id
      LEFT JOIN projects p ON ps.projectId = p.id
      LEFT JOIN groups g ON s.groupId = g.id
      LEFT JOIN users u ON g.coordinatorId = u.id
    `;

    const params = [];

    if (req.user.role === "student" || req.user.role === "coordinator") {
      query += ` WHERE s.groupId IN (SELECT groupId FROM group_members WHERE userId = ?)`;
      params.push(req.user.id);
    } else if (req.user.role === "teacher") {
      query += ` WHERE p.id IN (SELECT id FROM projects WHERE moduleId IN (SELECT id FROM modules WHERE teacherId = ?))`;
      params.push(req.user.id);
    }

    query += " ORDER BY s.submittedAt DESC";

    const [submissions] = await db.execute(query, params);
    res.json(submissions);
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create submission
router.post(
  "/",
  authenticateToken,
  [
    body("title")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Submission title must be at least 2 characters"),
    body("description").optional().trim(),
    body("stepId").isInt().withMessage("Valid step ID is required"),
    body("groupId").isInt().withMessage("Valid group ID is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, stepId, groupId, fileUrl } = req.body;

      // Check if user is member of the group
      const [memberships] = await db.execute(
        "SELECT id FROM group_members WHERE groupId = ? AND userId = ?",
        [groupId, req.user.id]
      );

      if (memberships.length === 0) {
        return res
          .status(403)
          .json({ message: "You are not a member of this group" });
      }

      // Create submission
      const [result] = await db.execute(
        "INSERT INTO submissions (title, description, stepId, groupId, fileUrl, status) VALUES (?, ?, ?, ?, ?, ?)",
        [title, description || "", stepId, groupId, fileUrl || null, "pending"]
      );

      res.status(201).json({
        message: "Submission created successfully",
        submissionId: result.insertId,
      });
    } catch (error) {
      console.error("Create submission error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update submission status (teachers only)
router.patch(
  "/:id/status",
  authenticateToken,
  requireRole(["teacher"]),
  [
    body("status")
      .isIn(["pending", "approved", "rejected"])
      .withMessage("Valid status is required"),
    body("comment").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, comment } = req.body;
      const submissionId = req.params.id;

      // Update submission status
      await db.execute("UPDATE submissions SET status = ? WHERE id = ?", [
        status,
        submissionId,
      ]);

      // Add comment if provided
      if (comment) {
        await db.execute(
          "INSERT INTO submission_comments (content, authorId, submissionId) VALUES (?, ?, ?)",
          [comment, req.user.id, submissionId]
        );
      }

      res.json({ message: "Submission status updated successfully" });
    } catch (error) {
      console.error("Update submission status error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get submission comments
router.get("/:id/comments", authenticateToken, async (req, res) => {
  try {
    const [comments] = await db.execute(
      `
      SELECT c.*, u.firstName, u.lastName, u.role
      FROM submission_comments c
      LEFT JOIN users u ON c.authorId = u.id
      WHERE c.submissionId = ?
      ORDER BY c.createdAt ASC
    `,
      [req.params.id]
    );

    res.json(comments);
  } catch (error) {
    console.error("Get submission comments error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add comment to submission
router.post(
  "/:id/comments",
  authenticateToken,
  [
    body("content")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Comment content is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content } = req.body;
      const submissionId = req.params.id;

      const [result] = await db.execute(
        "INSERT INTO submission_comments (content, authorId, submissionId) VALUES (?, ?, ?)",
        [content, req.user.id, submissionId]
      );

      res.status(201).json({
        message: "Comment added successfully",
        commentId: result.insertId,
      });
    } catch (error) {
      console.error("Add comment error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
