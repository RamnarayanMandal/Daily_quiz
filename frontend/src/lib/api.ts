const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options?.headers as Record<string, string>) };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('user_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      // also set cookie for middleware redirects
      try { document.cookie = `user_token=${token}; path=/; max-age=604800`; } catch {}
    }
  }
  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  });
  if (!res.ok) {
    let body: unknown = undefined;
    try { body = await res.json(); } catch {}
    throw { status: res.status, body };
  }
  return (await res.json()) as T;
}

export type StartQuizResponse = { quizId: string; questionIds: string[] };
export type QuestionsResponse = { questions: { _id: string; text: string; options: string[] }[] };
export type SubmitResponse = { totalCorrect: number; score: number; freeNext: boolean };

export function startQuiz(phone: string) {
  return apiFetch<StartQuizResponse>('/api/quiz/start', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function fetchQuestions(questionIds: string[]) {
  return apiFetch<QuestionsResponse>('/api/quiz/questions', {
    method: 'POST',
    body: JSON.stringify({ questionIds }),
  });
}

export function submitAnswers(quizId: string, phone: string, answers: { questionId: string; chosenIndex: number }[]) {
  return apiFetch<SubmitResponse>('/api/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({ quizId, phone, answers }),
  });
}

export function topUpWeb(phone: string, quantity: number) {
  return apiFetch<{ ok: boolean; credits: number }>('/api/topup/web', {
    method: 'POST',
    body: JSON.stringify({ phone, quantity }),
  });
}

export function fetchDailyLeaderboard(date?: string) {
  const qs = date ? `?date=${encodeURIComponent(date)}` : '';
  return apiFetch<{ dateKey: string; top: unknown[] }>(`/api/leaderboard/daily${qs}`);
}


