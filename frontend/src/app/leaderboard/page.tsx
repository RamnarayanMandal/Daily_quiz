"use client";
import { useEffect, useState } from "react";
import { fetchDailyLeaderboard } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type LeaderboardEntry = { userId?: { phone?: string } | string; totalPoints: number; totalSpentSzl: number; bestTimeMs?: number };

export default function LeaderboardPage() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<{ dateKey: string; top: LeaderboardEntry[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(d?: string) {
    setLoading(true);
    try {
      const res = await fetchDailyLeaderboard(d);
      setData(res as { dateKey: string; top: LeaderboardEntry[] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(date); }, [date]);

  return (
    <div className="min-h-[70vh] relative flex flex-col items-center p-4 md:p-8 bg-gradient-to-br from-purple-50 to-background rounded-xl">
      <Card className="w-full max-w-3xl mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-purple-700 text-center">Daily Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={new Date().toISOString().slice(0,10)} className="h-11 rounded-xl" />
            <button onClick={() => load(date)} className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900">
              {loading ? 'Loading…' : 'Load Leaderboard'}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-left">Leaderboard for {data?.dateKey || date}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : data?.top?.length ? (
            <div className="space-y-4">
              {data.top.map((e: LeaderboardEntry, idx: number) => {
                const displayName = typeof e.userId === 'string' ? e.userId : (e.userId?.phone || 'User');
                return (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-bold ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-purple-600'}`}>#{idx + 1}</span>
                    <span className="font-medium">{displayName}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{e.totalPoints} pts</div>
                    <div className="text-xs text-muted-foreground">Spent {e.totalSpentSzl} SZL{e.bestTimeMs ? ` · ${Math.round(e.bestTimeMs / 1000)}s` : ''}</div>
                  </div>
                </div>
              );})}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-10">No leaderboard data found for this date.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


