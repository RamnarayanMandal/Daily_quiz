import { Router } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { requireUser } from '../middleware/auth';

const router = Router();

// Web top-up: increments credits by 1 per 1 SZL
router.post('/web', requireUser, async (req, res) => {
  const schema = z.object({ phone: z.string().min(3), quantity: z.number().int().min(1).max(10) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { phone, quantity } = parsed.data;

  let user = await User.findOne({ phone });
  if (!user) user = await User.create({ phone });
  user.credits += quantity; // 1 SZL per set assumed
  await user.save();

  await Transaction.create({ userId: user._id, amountSzl: quantity, creditsAdded: quantity, type: 'TOP_UP' });
  return res.json({ ok: true, credits: user.credits });
});

// SMS webhook for MORE keyword
router.post('/sms', requireUser, async (req, res) => {
  const schema = z.object({ phone: z.string().min(3), keyword: z.literal('MORE'), externalId: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { phone, externalId } = parsed.data;

  let user = await User.findOne({ phone });
  if (!user) user = await User.create({ phone });
  user.credits += 1;
  await user.save();

  await Transaction.create({ userId: user._id, amountSzl: 1, creditsAdded: 1, type: 'SMS_TOP_UP', externalId });
  return res.json({ ok: true, credits: user.credits });
});

export default router;


