"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateQuestion({ onCreate }: { onCreate: (payload: { text: string; options: string[]; correctIndex: number }) => Promise<void> }) {
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  async function handleCreate() {
    if (!text || options.some((o) => !o)) return;
    await onCreate({ text, options, correctIndex });
    setText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
  }

  return (
    <Card>
      <CardHeader><CardTitle>Create Question</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Input placeholder="Question text" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="grid gap-2 md:grid-cols-2">
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input placeholder={`Option ${i + 1}`} value={o} onChange={(e) => setOptions((prev) => { const c = [...prev]; c[i] = e.target.value; return c; })} />
              <label className="flex items-center gap-1 text-sm"><input type="radio" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} /> Correct</label>
            </div>
          ))}
        </div>
        <Button onClick={handleCreate}>Add</Button>
      </CardContent>
    </Card>
  );
}


