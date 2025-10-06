import { Button } from "@/components/ui/button";

export default function DailySelection({ dateKey, items, selectedIds, setSelectedIds, onSave }: {
  dateKey: string;
  items: { _id: string; text: string }[];
  selectedIds: string[];
  setSelectedIds: (v: string[]) => void;
  onSave: () => Promise<void>;
}) {
  const count = selectedIds.length;
  return (
    <div className="space-y-4  ">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Daily Quiz Selection</h3>
          <p className="text-xs text-muted-foreground">Select exactly 10 questions for {dateKey}</p>
        </div>
        <div className="text-xs text-muted-foreground">Selected: <span className="font-medium">{count}/10</span></div>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        {items.map((q) => {
          const checked = selectedIds.includes(q._id);
          return (
            <label key={q._id} className={`rounded-full px-4 py-2 flex items-center gap-3 border shadow-sm ${checked ? 'bg-primary/10' : 'bg-muted'} hover:bg-primary/10 transition`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setSelectedIds(e.target.checked ? [...new Set([...selectedIds, q._id])] : selectedIds.filter((id) => id !== q._id))}
              />
              <span className="text-sm">{q.text}</span>
            </label>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Button className="rounded-full px-5" disabled={count !== 10} onClick={onSave}>Save Daily 10</Button>
      </div>
    </div>
  );
}


