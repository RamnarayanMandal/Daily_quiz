import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export const userAxios = axios.create({ baseURL });

userAxios.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

userAxios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      try { localStorage.removeItem('user_token'); document.cookie = 'user_token=; Max-Age=0; path=/'; } catch {}
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);


