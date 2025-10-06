import { Router } from 'express';
import { z } from 'zod';
import { Question } from '../models/Question';
import { QuizSession } from '../models/QuizSession';
import { User } from '../models/User';
import { getDateKey } from '../utils/date';
import mongoose from 'mongoose';
import { requireUser } from '../middleware/auth';
import { DailySelection } from '../models/DailySelection';

const router = Router();

// Start a quiz set for the authenticated user
router.post('/start', requireUser, async (req, res) => {
  const jwtUser = (req as any).user as { uid: string; phone?: string };
  const phone = jwtUser?.phone;
  if (!phone) return res.status(400).json({ error: 'AUTH_PHONE_MISSING' });

  const dateKey = getDateKey();

  try {
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone });
    }

    // Reuse in-progress session today (no charge)
    const existingInProgress = await QuizSession.findOne({ userId: user._id, dateKey, completedAt: { $exists: false } });
    if (existingInProgress) {
      return res.json({ quizId: existingInProgress._id, questionIds: existingInProgress.questionIds, paid: existingInProgress.paid });
    }

    // Determine if this set is free
    // Policy: one free completed set per day. If none completed today, grant free.
    let paid = true;
    const completedToday = await QuizSession.exists({ userId: user._id, dateKey, completedAt: { $exists: true } });
    if (!completedToday) {
      paid = false;
    } else if (user.freeChainActive) {
      paid = false;
      user.freeChainActive = false; // consume free
    } else {
      if (user.credits <= 0) {
        return res.status(402).json({ error: 'INSUFFICIENT_CREDITS' });
      }
      user.credits -= 1;
    }

    // pick daily selection if exists, else random 10
    let questionIds: any[] = [];
    const sel = await DailySelection.findOne({ dateKey });
    if (sel && sel.questionIds?.length === 10) {
      questionIds = sel.questionIds;
    } else {
      const questions = await Question.aggregate([{ $sample: { size: 10 } }]);
      questionIds = questions.map((q) => q._id);
    }

    const quiz = await QuizSession.create({
      userId: user._id,
      questionIds,
      answers: [],
      paid,
      dateKey,
    });

    await user.save();

    return res.json({ quizId: quiz._id, questionIds, paid });
  } catch (e) {
    return res.status(500).json({ error: 'FAILED_TO_START' });
  }
});

router.post('/questions', requireUser, async (req, res) => {
  const schema = z.object({ questionIds: z.array(z.string().length(24)) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { questionIds } = parsed.data;
  const questions = await Question.find({ _id: { $in: questionIds } }).select('text options');
  return res.json({ questions });
});

router.post('/submit', requireUser, async (req, res) => {
  const schema = z.object({
    quizId: z.string().length(24),
    answers: z.array(z.object({ questionId: z.string().length(24), chosenIndex: z.number().int().min(0).max(3) })).length(10),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { quizId, answers } = parsed.data;
  const jwtUser = (req as any).user as { uid: string; phone?: string };

  const quiz = await QuizSession.findById(quizId);
  if (!quiz) return res.status(404).json({ error: 'QUIZ_NOT_FOUND' });

  // Ensure the submitting user matches the quiz owner (derived from token)
  const user = await User.findOne({ phone: jwtUser?.phone });
  if (!user || String(user._id) !== String(quiz.userId)) return res.status(403).json({ error: 'USER_MISMATCH' });

  if (quiz.completedAt) return res.status(400).json({ error: 'ALREADY_COMPLETED' });

  const questionDocs = await Question.find({ _id: { $in: quiz.questionIds } });
  const questionMap = new Map(questionDocs.map((q) => [String(q._id), q]));
  let totalCorrect = 0;
  const normalized = answers.map((a) => {
    const q = questionMap.get(a.questionId);
    const correct = q ? q.correctIndex === a.chosenIndex : false;
    if (correct) totalCorrect += 1;
    return { questionId: new mongoose.Types.ObjectId(a.questionId), chosenIndex: a.chosenIndex, correct };
  });

  quiz.answers = normalized;
  quiz.completedAt = new Date();
  quiz.totalCorrect = totalCorrect;
  quiz.totalTimeMs = quiz.completedAt.getTime() - quiz.startedAt.getTime();
  await quiz.save();

  // Scoring and chaining logic
  // If 10/10 then next set becomes free
  if (totalCorrect === 10) {
    user.freeChainActive = true;
    await user.save();
  }

  const perQuestion = answers.map((a) => {
    const q = questionMap.get(a.questionId);
    return {
      questionId: a.questionId,
      chosenIndex: a.chosenIndex,
      correctIndex: q ? q.correctIndex : -1,
      correct: q ? q.correctIndex === a.chosenIndex : false,
    };
  });

  return res.json({ totalCorrect, score: totalCorrect * 10, freeNext: totalCorrect === 10, results: perQuestion });
});

export default router;


