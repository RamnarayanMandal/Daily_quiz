"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listQuestions, getDailySelection, setDailySelection } from "@/lib/adminApi";
import DailySelection from "@/components/admin/DailySelection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Q = { _id: string; text: string; options: string[]; correctIndex: number };

export default function DailySelectionPage() {
  const router = useRouter();
  const [items, setItems] = useState<Q[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dateKey, setDateKey] = useState<string>("");

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) router.replace('/admin/login');
    else load();
  }, [router]);

  async function load() {
    try {
      const res = await listQuestions();
      setItems(res.items);
      const sel = await getDailySelection();
      setDateKey(sel.dateKey);
      setSelectedIds(sel.selection?.questionIds || []);
    } catch {
      toast.error('Failed to load selection');
    }
  }

  return (
    <div className="space-y-6">
     
      <Card className="shadow-sm mt-14">
        <CardHeader><CardTitle>Daily Quiz Selection</CardTitle></CardHeader>
        <CardContent>
          <DailySelection
            dateKey={dateKey}
            items={items}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onSave={async () => {
              await setDailySelection(selectedIds);
              toast.success('Daily selection saved');
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}


