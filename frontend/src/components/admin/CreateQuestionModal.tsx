"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CreateQuestionModal({ onCreate, trigger }: { onCreate: (p: { text: string; options: string[]; correctIndex: number }) => Promise<void>; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!text || options.some((o) => !o)) return;
    setLoading(true);
    await onCreate({ text, options, correctIndex });
    setText(""); setOptions(["", "", "", ""]); setCorrectIndex(0); setOpen(false);
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Question</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Question text" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="grid gap-2 md:grid-cols-2">
            {options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input placeholder={`Option ${i + 1}`} value={o} onChange={(e) => setOptions((prev) => { const c = [...prev]; c[i] = e.target.value; return c; })} />
                <label className="text-xs flex items-center gap-1"><input type="radio" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} /> Correct</label>
              </div>
            ))}
          </div>
          <Button onClick={handleCreate} disabled={loading}>{loading ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving…</span>) : 'Add'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


