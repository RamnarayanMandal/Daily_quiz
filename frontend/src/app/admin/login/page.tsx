"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminLogin } from "@/lib/adminApi";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("secret123");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (t) router.replace('/admin/dashboard');
  }, [router]);

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      if (remember) localStorage.setItem('admin_token', res.token);
      else sessionStorage.setItem('admin_token', res.token);
      toast.success('Logged in');
      router.replace('/admin/dashboard');
    } catch {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-bold">QR</div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage questions and daily selection</p>
        </div>
        <Card className="shadow-md border-muted bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Sign in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input placeholder="••••••••" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" aria-label="toggle password" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-2 px-2 text-xs text-muted-foreground hover:text-foreground">
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
              <a className="text-xs text-primary hover:underline" href="#">Need help?</a>
            </div>
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              {loading ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</span>) : 'Sign in'}
            </Button>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">Protected area — authorized users only.</p>
      </div>
    </div>
  );
}


