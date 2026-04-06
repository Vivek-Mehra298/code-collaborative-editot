import express from 'express';
import Room from '../models/Room';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { roomId, language } = req.body;
    if (!roomId) {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    let room = await Room.findOne({ roomId });
    if (!room) {
      room = new Room({
        roomId,
        createdBy: req.user,
        language: language || 'javascript',
        code: '',
        participants: [req.user]
      });
      await room.save();
    }
    
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/recent', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Find rooms where user is participant or creator
    const rooms = await Room.find({
      $or: [{ createdBy: req.user }, { participants: req.user }]
    }).sort({ lastActive: -1 }).limit(10);
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/:roomId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;
