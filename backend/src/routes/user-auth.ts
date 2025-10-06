import { Router } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', async (req, res) => {
  const schema = z.object({ phone: z.string().min(3), email: z.string().email().optional(), displayName: z.string().optional(), password: z.string().min(6).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { phone, email, displayName, password } = parsed.data;
  const exists = await User.findOne({ phone });
  if (exists) return res.status(409).json({ error: 'ALREADY_EXISTS' });
  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
  const user = await User.create({ phone, email, displayName, passwordHash, credits: 1 });
  return res.json({ id: user._id, phone: user.phone, displayName: user.displayName });
});

router.post('/login', async (req, res) => {
  const schema = z.object({ phone: z.string().min(3).optional(), email: z.string().email().optional(), password: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { phone, email, password } = parsed.data;
  const user = await User.findOne(phone ? { phone } : { email });
  if (!user) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  if (user.passwordHash) {
    if (!password) return res.status(401).json({ error: 'PASSWORD_REQUIRED' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'JWT_NOT_CONFIGURED' });
  const token = jwt.sign({ uid: String(user._id), phone: user.phone }, secret, { expiresIn: '7d' });
  return res.json({ token, user: { id: user._id, phone: user.phone, displayName: user.displayName, credits: user.credits } });
});

export default router;


