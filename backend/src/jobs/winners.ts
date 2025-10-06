import { DailyResult } from '../models/DailyResult';
import { getDateKey } from '../utils/date';

export interface WinnerEntry {
  userId: string;
  totalPoints: number;
  totalSpentSzl: number;
  bestTimeMs?: number;
}

// Returns top 2 winners per rules: max points, then max spent, then min time
export async function selectDailyWinners(dateKey: string = getDateKey()): Promise<WinnerEntry[]> {
  const top = await DailyResult.find({ dateKey })
    .sort({ totalPoints: -1, totalSpentSzl: -1, bestTimeMs: 1 })
    .limit(2)
    .lean();

  return top.map((r) => ({
    userId: String(r.userId),
    totalPoints: r.totalPoints,
    totalSpentSzl: r.totalSpentSzl,
    ...(r.bestTimeMs != null ? { bestTimeMs: r.bestTimeMs } : {}),
  }));
}


