"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) router.replace('/admin/login');
  }, [router]);
  return <>{children}</>;
}


