import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { getJwtSecret } from '../config';
import { isDatabaseReady } from '../db';

const router = express.Router();

const ensureDatabaseReady = (res: express.Response) => {
  if (isDatabaseReady()) {
    return true;
  }

  res.status(503).json({ message: 'Database not connected. Check MongoDB configuration.' });
  return false;
};

router.post('/register', async (req, res) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return;
    }

    const { name, email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ name, email, passwordHash });
    await user.save();

    const payload = { userId: user.id };
    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/login', async (req, res) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return;
    }

    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return;
    }

    const user = await User.findById(req.user).select('-passwordHash');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;
