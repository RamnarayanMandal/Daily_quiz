import axios from 'axios';
import Cookies from 'js-cookie';

const baseURL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export const user = axios.create({ baseURL });

user.interceptors.request.use((config) => {
  const token = Cookies.get('user_token') || (typeof window !== 'undefined' ? localStorage.getItem('user_token') : undefined);
  if (token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

user.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('user_token');
      try { localStorage.removeItem('user_token'); } catch {}
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?next=${next}`;
    }
    return Promise.reject(err);
  }
);




