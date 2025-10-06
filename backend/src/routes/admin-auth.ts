import { Router } from 'express';
import { z } from 'zod';
import { Admin } from '../models/Admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', async (req, res) => {
  const schema = z.object({ email: z.string().email(), name: z.string().optional(), password: z.string().min(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { email, name, password } = parsed.data;
  const existing = await Admin.findOne({ email });
  if (existing) return res.status(409).json({ error: 'ALREADY_EXISTS' });
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ email, name, passwordHash });
  return res.json({ id: admin._id, email: admin.email, name: admin.name });
});

router.post('/login', async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { email, password } = parsed.data;
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'JWT_NOT_CONFIGURED' });
  const token = jwt.sign({ role: 'admin', email: admin.email, id: String(admin._id) }, secret, { expiresIn: '12h' });
  return res.json({ token });
});

export default router;


