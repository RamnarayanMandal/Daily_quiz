import { Router } from 'express';
import { DailyResult } from '../models/DailyResult';
import { getDateKey } from '../utils/date';
import { requireUser } from '../middleware/auth';

const router = Router();

router.get('/daily', requireUser, async (req, res) => {
  const dateKey = (req.query.date as string) || getDateKey();
  const top = await DailyResult.find({ dateKey })
    .sort({ totalPoints: -1, totalSpentSzl: -1, bestTimeMs: 1 })
    .limit(50)
    .populate('userId', 'phone displayName')
    .lean();
  return res.json({ dateKey, top });
});

export default router;


