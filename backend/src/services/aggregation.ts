import { QuizSession } from '../models/QuizSession';
import { DailyResult } from '../models/DailyResult';
import { Transaction } from '../models/Transaction';
import { getDateKey } from '../utils/date';

// Recompute daily aggregates for a given date
export async function recomputeDaily(dateKey: string = getDateKey()): Promise<void> {
  // Sum points (10 per correct) per user
  const sessions = await QuizSession.aggregate([
    { $match: { dateKey, completedAt: { $ne: null } } },
    { $group: { _id: '$userId', points: { $sum: { $multiply: ['$totalCorrect', 10] } }, bestTimeMs: { $min: '$totalTimeMs' } } },
  ]);

  const spends = await Transaction.aggregate([
    { $match: { createdAt: { $gte: new Date(`${dateKey}T00:00:00.000Z`), $lte: new Date(`${dateKey}T23:59:59.999Z`) } } },
    { $group: { _id: '$userId', spent: { $sum: '$amountSzl' } } },
  ]);

  const spendMap = new Map(spends.map((s: any) => [String(s._id), s.spent]));

  for (const s of sessions) {
    const totalSpentSzl = spendMap.get(String(s._id)) || 0;
    await DailyResult.findOneAndUpdate(
      { userId: s._id, dateKey },
      { totalPoints: s.points, bestTimeMs: s.bestTimeMs ?? undefined, totalSpentSzl },
      { upsert: true }
    );
  }
}


