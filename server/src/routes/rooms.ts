import express from 'express';
import Room from '../models/Room';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = express.Router();
const populateRoom = <T extends { populate: (path: string, select?: string) => T }>(query: T) =>
  query.populate('participants', 'name email').populate('createdBy', 'name email');

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

    const populatedRoom = await populateRoom(Room.findById(room._id));
    res.json(populatedRoom);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/recent', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Find rooms where user is participant or creator
    const rooms = await populateRoom(Room.find({
      $or: [{ createdBy: req.user }, { participants: req.user }]
    })).sort({ lastActive: -1 }).limit(10);
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/:roomId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const room = await populateRoom(Room.findOne({ roomId: req.params.roomId }));
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/:roomId/join', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.participants.some((participant) => participant.toString() === req.user)) {
      room.participants.push(req.user as never);
      room.lastActive = new Date();
      await room.save();
    }

    const populatedRoom = await populateRoom(Room.findById(room._id));
    res.json(populatedRoom);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/:roomId/leave', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.participants = room.participants.filter((participant) => participant.toString() !== req.user);
    room.lastActive = new Date();
    await room.save();

    const populatedRoom = await populateRoom(Room.findById(room._id));
    res.json(populatedRoom);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.patch('/:roomId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { code, language } = req.body as { code?: string; language?: string };
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (typeof code === 'string') {
      room.code = code;
    }

    if (typeof language === 'string' && language.trim()) {
      room.language = language;
    }

    if (!room.participants.some((participant) => participant.toString() === req.user)) {
      room.participants.push(req.user as never);
    }

    room.lastActive = new Date();
    await room.save();

    const populatedRoom = await populateRoom(Room.findById(room._id));
    res.json(populatedRoom);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;
