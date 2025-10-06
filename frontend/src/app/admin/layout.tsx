"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import CreateQuestionModal from "@/components/admin/CreateQuestionModal";
import { Button } from "@/components/ui/button";
import { createQuestion } from "@/lib/adminApi";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const active = pathname?.includes("daily-selection") ? "daily" : "all";

  // Simple auth guard: redirect to login if no token
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (!t) router.replace('/admin/login');
  }, [router]);

  return (
    <div className="grid md:grid-cols-[auto_1fr] gap-4 md:gap-6">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        onOpenCreate={() => {}}
        activeKey={active as 'all' | 'daily'}
        onNavigate={(key) => {
          if (key === 'daily') router.push('/admin/daily-selection');
          else router.push('/admin/dashboard');
        }}
        onLogout={() => {
          try { localStorage.removeItem('admin_token'); localStorage.removeItem('user_token'); } catch {}
          document.cookie = 'user_token=; Max-Age=0; path=/';
          router.replace('/auth');
        }}
      />
      <div className="space-y-6">
        <AdminHeader
          rightSlot={
            <CreateQuestionModal
              onCreate={async (payload) => { await createQuestion(payload); toast.success('Created'); }}
              trigger={<Button>+ Create Question</Button>}
            />
          }
        />
        {children}
      </div>
    </div>
  );
}


