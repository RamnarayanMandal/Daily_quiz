"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { user } from "@/utils/user";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
import { setCookie } from "@/lib/cookies";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function AuthInner() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/quiz";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // If email+password provided, attempt admin login first
      if (email && password) {
        try {
          const adminRes = await fetch(`${API_BASE}/api/admin/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          if (adminRes.ok) {
            const data = await adminRes.json();
            const adminToken = data.token as string;
            setCookie('user_token', adminToken, 7); // satisfy middleware
            try { localStorage.setItem('admin_token', adminToken); } catch {}
            toast.success('Admin login');
            router.replace('/admin/dashboard');
            return;
          }
        } catch {}
      }

      // Fallback to user login
      const body: { email?: string; password?: string; phone?: string } = email ? { email, password } : { phone };
      if (password) body.password = password;
      const res = await user.post('/api/auth/login', body);
      const token = res.data.token as string;
      setCookie('user_token', token, 7);
      try { localStorage.setItem('user_token', token); if (phone) localStorage.setItem('phone', phone); } catch {}
      toast.success('Logged in');
      router.replace(next);
    } catch {
      toast.error('Login failed');
    } finally { setLoading(false); }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await user.post('/api/auth/register', { phone, email, password, displayName: name });
      toast.success('Account created');
      setIsLogin(true);
    } catch { toast.error('Signup failed'); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-50 p-4">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center md:text-left md:items-start mb-8 md:mb-0">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary leading-tight">Join Daily Quiz</h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600">Create an account to play quizzes and win streak rewards.</p>
      </div>
      <div className="flex-1 flex items-center justify-center w-full md:max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button onClick={()=>setIsLogin(true)} className={`flex-1 text-center py-2 rounded-lg transition-all ${isLogin ? 'bg-primary text-primary-foreground shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}>Login</button>
            <button onClick={()=>setIsLogin(false)} className={`flex-1 text-center py-2 rounded-lg transition-all ${!isLogin ? 'bg-primary text-primary-foreground shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}>Sign Up</button>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">{isLogin ? 'Welcome Back!' : 'Create Your Account'}</h2>
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" placeholder="Email (or leave blank to use phone)" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <input type="password" placeholder="Password (optional)" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" value={password} onChange={(e)=>setPassword(e.target.value)} />
              <button type="submit" disabled={loading} className="w-full py-2 px-4 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition shadow-md">
                {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Logging in…</span> : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <input type="text" placeholder="Name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" value={name} onChange={(e)=>setName(e.target.value)} />
              <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <input type="tel" placeholder="Phone (optional)" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" value={phone} onChange={(e)=>setPhone(e.target.value)} />
              <input type="password" placeholder="Password " className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" value={password} onChange={(e)=>setPassword(e.target.value)} />
              <button type="submit" disabled={loading} className="w-full py-2 px-4 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition shadow-md">
                {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Creating…</span> : 'Sign Up'}
              </button>
            </form>
          )}
          <p className="mt-6 text-sm text-gray-500 text-center">
            {isLogin ? "Don't have an account?" : "Already have an account?"} {" "}
            <button onClick={()=>setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">{isLogin ? 'Sign Up' : 'Login'}</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading…</div>}>
      <AuthInner />
    </Suspense>
  );
}


