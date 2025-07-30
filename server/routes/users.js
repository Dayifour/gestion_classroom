import express from "express";
import db from "../config/database.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
const router = express.Router();

// Get all users (teachers only)
router.get(
  "/",
  authenticateToken,
  requireRole(["teacher"]),
  async (req, res) => {
    try {
      const [users] = await db.execute(
        "SELECT id, firstName, lastName, email, role, createdAt FROM users ORDER BY createdAt DESC"
      );
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get students
router.get("/students", authenticateToken, async (req, res) => {
  try {
    const [students] = await db.execute(
      'SELECT id, firstName, lastName, email, createdAt FROM users WHERE role IN ("student", "coordinator") ORDER BY firstName, lastName'
    );
    res.json(students);
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
