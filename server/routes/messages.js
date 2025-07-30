const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get conversations for current user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const [conversations] = await db.execute(`
      SELECT DISTINCT 
        CASE 
          WHEN m.senderId = ? THEN m.receiverId 
          ELSE m.senderId 
        END as otherUserId,
        u.firstName, u.lastName, u.role,
        MAX(m.createdAt) as lastMessageTime,
        (SELECT content FROM messages m2 
         WHERE (m2.senderId = ? AND m2.receiverId = otherUserId) 
            OR (m2.senderId = otherUserId AND m2.receiverId = ?)
         ORDER BY m2.createdAt DESC LIMIT 1) as lastMessage,
        COUNT(CASE WHEN m.receiverId = ? AND m.isRead = 0 THEN 1 END) as unreadCount
      FROM messages m
      LEFT JOIN users u ON u.id = CASE WHEN m.senderId = ? THEN m.receiverId ELSE m.senderId END
      WHERE m.senderId = ? OR m.receiverId = ?
      GROUP BY otherUserId, u.firstName, u.lastName, u.role
      ORDER BY lastMessageTime DESC
    `, [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]);

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between current user and another user
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const [messages] = await db.execute(`
      SELECT m.*, 
             s.firstName as senderFirstName, s.lastName as senderLastName,
             r.firstName as receiverFirstName, r.lastName as receiverLastName
      FROM messages m
      LEFT JOIN users s ON m.senderId = s.id
      LEFT JOIN users r ON m.receiverId = r.id
      WHERE (m.senderId = ? AND m.receiverId = ?) 
         OR (m.senderId = ? AND m.receiverId = ?)
      ORDER BY m.createdAt ASC
    `, [req.user.id, otherUserId, otherUserId, req.user.id]);

    // Mark messages as read
    await db.execute(
      'UPDATE messages SET isRead = 1 WHERE senderId = ? AND receiverId = ?',
      [otherUserId, req.user.id]
    );

    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/', authenticateToken, [
  body('receiverId').isInt().withMessage('Valid receiver ID is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Message content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId, content } = req.body;

    // Check if receiver exists
    const [receivers] = await db.execute(
      'SELECT id FROM users WHERE id = ?',
      [receiverId]
    );

    if (receivers.length === 0) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const [result] = await db.execute(
      'INSERT INTO messages (senderId, receiverId, content) VALUES (?, ?, ?)',
      [req.user.id, receiverId, content]
    );

    res.status(201).json({
      message: 'Message sent successfully',
      messageId: result.insertId
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;