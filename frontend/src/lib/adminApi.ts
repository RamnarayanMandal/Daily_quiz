const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as Record<string, string>) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    let body: unknown = undefined;
    try { body = await res.json(); } catch {}
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      // Best-effort redirect to login
      try { window.location.href = '/admin/login'; } catch {}
    }
    throw { status: res.status, body };
  }
  return (await res.json()) as T;
}

export async function adminLogin(email: string, password: string): Promise<{ token: string }> {
  return api('/api/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function listQuestions(): Promise<{ items: { _id: string; text: string; options: string[]; correctIndex: number }[] }> {
  return api('/api/admin/questions');
}

export async function createQuestion(payload: { text: string; options: string[]; correctIndex: number }): Promise<{ item: { _id: string } }> {
  return api('/api/admin/questions', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateQuestion(id: string, payload: { text: string; options: string[]; correctIndex: number }): Promise<{ item: { _id: string } }> {
  return api(`/api/admin/questions/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteQuestion(id: string): Promise<{ ok: boolean }> {
  return api(`/api/admin/questions/${id}`, { method: 'DELETE' });
}

export async function seedQuestions(items: { text: string; options: string[]; correctIndex: number }[]): Promise<{ created: number }> {
  return api('/api/admin/questions/seed', { method: 'POST', body: JSON.stringify({ items }) });
}

export async function getDailySelection(date?: string): Promise<{ dateKey: string; selection?: { questionIds: string[] } }> {
  const qs = date ? `?date=${encodeURIComponent(date)}` : '';
  return api(`/api/admin/daily-selection${qs}`);
}

export async function setDailySelection(questionIds: string[], date?: string): Promise<{ dateKey: string; selection: { questionIds: string[] } }> {
  return api('/api/admin/daily-selection', { method: 'POST', body: JSON.stringify({ dateKey: date, questionIds }) });
}


