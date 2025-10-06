"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type Question = { _id: string; text: string; options: string[]; correctIndex: number };

export default function QuestionList({ items, onUpdate, onDelete, onOptionChange, onCorrectIndexChange }: {
  items: Question[];
  onUpdate: (q: Question) => void;
  onDelete: (id: string) => void;
  onOptionChange: (id: string, idx: number, value: string) => void;
  onCorrectIndexChange: (id: string, idx: number) => void;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (page - 1) * pageSize;
  const visible = items.slice(start, start + pageSize);

  return (
    <div className="space-y-4">
      {visible.map((q) => (
        <div key={q._id} className="border rounded-2xl p-3 space-y-2 shadow-sm">
          <Input value={q.text} onChange={(e) => onUpdate({ ...q, text: e.target.value })} />
          <div className="grid gap-2 md:grid-cols-2">
            {q.options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={o} onChange={(e) => onOptionChange(q._id, i, e.target.value)} />
                <label className="flex items-center gap-1 text-sm"><input type="radio" checked={q.correctIndex === i} onChange={() => onCorrectIndexChange(q._id, i)} /> Correct</label>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button className="rounded-full" variant="secondary" onClick={() => onUpdate(q)}>Save</Button>
            <Button className="rounded-full" variant="destructive" onClick={() => onDelete(q._id)}>Delete</Button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between text-sm">
        <span>Page {page} / {totalPages}</span>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      </div>
    </div>
  );
}


