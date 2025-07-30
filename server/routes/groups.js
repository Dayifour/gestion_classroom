import express from "express";
import { body, validationResult } from "express-validator";
import db from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();

// Get all groups
router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT g.*, m.name as moduleName, m.teacherId,
             u.firstName as coordinatorFirstName, u.lastName as coordinatorLastName
      FROM groups g
      LEFT JOIN modules m ON g.moduleId = m.id
      LEFT JOIN users u ON g.coordinatorId = u.id
    `;

    const params = [];

    if (req.user.role === "student" || req.user.role === "coordinator") {
      query += ` WHERE g.id IN (SELECT groupId FROM group_members WHERE userId = ?)`;
      params.push(req.user.id);
    } else if (req.user.role === "teacher") {
      query += ` WHERE m.teacherId = ?`;
      params.push(req.user.id);
    }

    query += " ORDER BY g.createdAt DESC";

    const [groups] = await db.execute(query, params);

    // Get members for each group
    for (let group of groups) {
      const [members] = await db.execute(
        `
        SELECT u.id, u.firstName, u.lastName, u.email, u.role
        FROM users u
        INNER JOIN group_members gm ON u.id = gm.userId
        WHERE gm.groupId = ?
        ORDER BY u.firstName, u.lastName
      `,
        [group.id]
      );
      group.members = members;
    }

    res.json(groups);
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create group
router.post(
  "/",
  authenticateToken,
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Group name must be at least 2 characters"),
    body("moduleId").isInt().withMessage("Valid module ID is required"),
    body("memberIds")
      .isArray({ min: 1 })
      .withMessage("At least one member is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, moduleId, memberIds } = req.body;

      // Check if user is enrolled in the module
      const [enrollments] = await db.execute(
        "SELECT id FROM module_students WHERE moduleId = ? AND studentId = ?",
        [moduleId, req.user.id]
      );

      if (enrollments.length === 0) {
        return res
          .status(403)
          .json({ message: "You are not enrolled in this module" });
      }

      // Create group with current user as coordinator
      const [result] = await db.execute(
        "INSERT INTO groups (name, coordinatorId, moduleId) VALUES (?, ?, ?)",
        [name, req.user.id, moduleId]
      );

      const groupId = result.insertId;

      // Add members to group (including coordinator)
      const allMemberIds = [...new Set([req.user.id, ...memberIds])];

      for (const memberId of allMemberIds) {
        await db.execute(
          "INSERT INTO group_members (groupId, userId) VALUES (?, ?)",
          [groupId, memberId]
        );
      }

      res.status(201).json({
        message: "Group created successfully",
        groupId,
      });
    } catch (error) {
      console.error("Create group error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get group by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const [groups] = await db.execute(
      `
      SELECT g.*, m.name as moduleName, m.teacherId,
             u.firstName as coordinatorFirstName, u.lastName as coordinatorLastName
      FROM groups g
      LEFT JOIN modules m ON g.moduleId = m.id
      LEFT JOIN users u ON g.coordinatorId = u.id
      WHERE g.id = ?
    `,
      [req.params.id]
    );

    if (groups.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Get group members
    const [members] = await db.execute(
      `
      SELECT u.id, u.firstName, u.lastName, u.email, u.role
      FROM users u
      INNER JOIN group_members gm ON u.id = gm.userId
      WHERE gm.groupId = ?
      ORDER BY u.firstName, u.lastName
    `,
      [req.params.id]
    );

    const group = { ...groups[0], members };
    res.json(group);
  } catch (error) {
    console.error("Get group error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
