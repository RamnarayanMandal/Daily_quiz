"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { topUpWeb } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TopUpPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const pricePerSet = 1;

  useEffect(() => {
    const p = localStorage.getItem("phone");
    if (p) setPhone(p);
  }, []);

  async function handleTopUp() {
    if (!phone) return toast.error("Enter phone number");
    setLoading(true);
    try {
      const res = await topUpWeb(phone, qty);
      toast.success(`Credits: ${res.credits}`);
      // Go to quiz so the user can immediately play
      router.push('/quiz');
    } catch {
      toast.error("Top up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] relative flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-background rounded-xl">
      <div className="absolute top-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply blur-xl opacity-20" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-200 rounded-full mix-blend-multiply blur-xl opacity-20" />

      <div className="relative z-10 bg-white p-8 md:p-10 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100">
        <h1 className="text-3xl font-extrabold text-purple-700 mb-6 text-center tracking-tight">Top Up</h1>

        <div className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-2">Phone Number</label>
            <Input id="phone" type="tel" placeholder="e.g., 6352396302" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 rounded-xl" />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Number of Sets</label>
            <div className="flex items-center gap-3">
              <Button type="button" variant="secondary" className="h-12 w-12 rounded-xl" onClick={() => setQty((v) => Math.max(1, v - 1))}>-</Button>
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || '1', 10)))} className="h-12 text-center rounded-xl" />
              <Button type="button" variant="secondary" className="h-12 w-12 rounded-xl" onClick={() => setQty((v) => v + 1)}>+</Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{qty} sets × {pricePerSet} SZL each</p>
          </div>

          <Button onClick={handleTopUp} disabled={loading} className="w-full h-12 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900">
            {loading ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Processing…</span>) : `Pay ${qty * pricePerSet} SZL`}
          </Button>
          <Button variant="secondary" onClick={() => router.push('/quiz')} className="w-full h-11 font-semibold rounded-2xl">Start Quiz</Button>
        </div>
      </div>
    </div>
  );
}


