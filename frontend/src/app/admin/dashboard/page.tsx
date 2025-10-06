"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listQuestions, createQuestion, updateQuestion, deleteQuestion, getDailySelection, setDailySelection } from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
// Sidebar, Header, Create modal now provided by admin layout
import DailySelection from "@/components/admin/DailySelection";
import QuestionList from "@/components/admin/QuestionList";
import { toast } from "sonner";

type Q = { _id: string; text: string; options: string[]; correctIndex: number };

export default function AdminDashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<Q[]>([]);
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dateKey, setDateKey] = useState<string>("");
  // layout handles sidebar/header

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) router.replace('/admin/login');
    else load();
  }, [router]);

  async function load() {
    try {
      setLoading(true);
      const res = await listQuestions();
      setItems(res.items);
      const sel = await getDailySelection();
      setDateKey(sel.dateKey);
      setSelectedIds(sel.selection?.questionIds || []);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }

  function handleOptionChange(questionId: string, optionIndex: number, value: string) {
    setItems((prev) => prev.map((q) => {
      if (q._id !== questionId) return q;
      const nextOptions = q.options.map((opt, idx) => (idx === optionIndex ? value : opt));
      return { ...q, options: nextOptions };
    }));
  }

  function handleCorrectIndexChange(questionId: string, index: number) {
    setItems((prev) => prev.map((q) => (q._id === questionId ? { ...q, correctIndex: index } : q)));
  }

  async function handleCreate() {
    if (!text || options.some((o) => !o)) return toast.error('Fill all fields');
    try {
      await createQuestion({ text, options, correctIndex });
      setText("");
      setOptions(["", "", "", ""]);
      setCorrectIndex(0);
      await load();
      toast.success('Created');
    } catch {
      toast.error('Create failed');
    }
  }

  async function handleUpdate(q: Q) {
    try {
      await updateQuestion(q._id, q);
      toast.success('Updated');
      await load();
    } catch {
      toast.error('Update failed');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteQuestion(id);
      toast.success('Deleted');
      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch {
      toast.error('Delete failed');
    }
  }

  // Content only; layout provides chrome
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-sm  mt-14">
        {/* <CardHeader><CardTitle>Daily Quiz Selection</CardTitle></CardHeader> */}
        <CardContent className="space-y-4">
          <DailySelection dateKey={dateKey} items={items} selectedIds={selectedIds} setSelectedIds={setSelectedIds} onSave={async () => { await setDailySelection(selectedIds); toast.success('Daily selection saved'); }} />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader><CardTitle>All Questions</CardTitle></CardHeader>
        <CardContent>
          <QuestionList items={items} onUpdate={handleUpdate} onDelete={handleDelete} onOptionChange={handleOptionChange} onCorrectIndexChange={handleCorrectIndexChange} />
        </CardContent>
      </Card>
    </>
  );
}

// list moved to components/admin/QuestionList


