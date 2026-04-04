import express from 'express';
import ChatSession from '../models/ChatSession.js';
import protectOfficer from '../middleware/officerMiddleware.js';

const router = express.Router();

// Get pending sessions for a department (officer dashboard)
router.get('/sessions/:department', protectOfficer, async (req, res) => {
  try {
    const { department } = req.params;
    // Ensure officer can only see their own department
    if (req.user.department !== department && req.user.department !== 'admin') {
      return res.status(403).json({ error: 'Not authorized for this department' });
    }
    const sessions = await ChatSession.find({
      department,
      status: 'pending'
    }).populate('studentId', 'name regNo email');
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get a single session with all messages
router.get('/session/:sessionId', protectOfficer, async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId)
      .populate('studentId', 'name regNo email');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    // Check authorization: officer must belong to the same department
    if (req.user.department !== session.department && req.user.department !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Mark session as active (officer takes it)
router.put('/session/:sessionId/start', protectOfficer, async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (req.user.department !== session.department && req.user.department !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (session.status !== 'pending') {
      return res.status(400).json({ error: 'Session already taken or closed' });
    }
    session.status = 'active';
    session.officerId = req.user.id;
    await session.save();
    res.json(session);
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Mark session as closed
router.put('/session/:sessionId/close', protectOfficer, async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (req.user.department !== session.department && req.user.department !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (session.status === 'closed') {
      return res.status(400).json({ error: 'Session already closed' });
    }
    session.status = 'closed';
    session.endedAt = new Date();
    await session.save();
    res.json({ message: 'Session closed' });
  } catch (error) {
    console.error('Error closing session:', error);
    res.status(500).json({ error: 'Failed to close session' });
  }
});

export default router;