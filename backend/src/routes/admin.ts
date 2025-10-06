import { Router } from 'express';
import { z } from 'zod';
import { Question } from '../models/Question';
import { recomputeDaily } from '../services/aggregation';
import { selectDailyWinners } from '../jobs/winners';
import { requireAdmin } from '../middleware/auth';
import { DailySelection } from '../models/DailySelection';
import { getDateKey } from '../utils/date';

const router = Router();

router.post('/questions/seed', requireAdmin, async (req, res) => {
  const schema = z.object({
    items: z.array(
      z.object({ text: z.string().min(1), options: z.array(z.string()).length(4), correctIndex: z.number().int().min(0).max(3) })
    ).min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { items } = parsed.data;
  const created = await Question.insertMany(items);
  return res.json({ created: created.length });
});

// CRUD: list, create, update, delete
router.get('/questions', requireAdmin, async (req, res) => {
  const schema = z.object({
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  });
  const parsed = schema.safeParse(req.query);
  const { search, page = '1', limit = '50' } = parsed.success ? parsed.data : {} as any;
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(String(limit), 10) || 50));
  const filter: any = search ? { text: { $regex: search, $options: 'i' } } : {};
  const [items, total] = await Promise.all([
    Question.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Question.countDocuments(filter),
  ]);
  return res.json({ items, total, page: pageNum, limit: limitNum });
});

router.post('/questions', requireAdmin, async (req, res) => {
  const schema = z.object({ text: z.string().min(1), options: z.array(z.string()).length(4), correctIndex: z.number().int().min(0).max(3) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const created = await Question.create(parsed.data);
  return res.json({ item: created });
});

router.put('/questions/:id', requireAdmin, async (req, res) => {
  const schema = z.object({ text: z.string().min(1), options: z.array(z.string()).length(4), correctIndex: z.number().int().min(0).max(3) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const updated = await Question.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  return res.json({ item: updated });
});

router.delete('/questions/:id', requireAdmin, async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
});

// Daily selection endpoints
router.get('/daily-selection', requireAdmin, async (req, res) => {
  const dateKey = (req.query.date as string) || getDateKey();
  const sel = await DailySelection.findOne({ dateKey });
  return res.json({ dateKey, selection: sel });
});

router.post('/daily-selection', requireAdmin, async (req, res) => {
  const schema = z.object({ dateKey: z.string().optional(), questionIds: z.array(z.string().length(24)).length(10) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const dateKey = parsed.data.dateKey || getDateKey();
  const questionIds = parsed.data.questionIds;
  const sel = await DailySelection.findOneAndUpdate(
    { dateKey },
    { dateKey, questionIds },
    { upsert: true, new: true }
  );
  return res.json({ dateKey, selection: sel });
});

router.post('/aggregate/daily', requireAdmin, async (req, res) => {
  const schema = z.object({ dateKey: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  await recomputeDaily(parsed.data.dateKey);
  return res.json({ ok: true });
});

export default router;

// Winners (top 2) for a given date
router.get('/winners/daily', requireAdmin, async (req, res) => {
  const dateKey = (req.query.date as string) || undefined;
  const winners = await selectDailyWinners(dateKey);
  return res.json({ winners });
});


