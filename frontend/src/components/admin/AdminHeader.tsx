import { Button } from "@/components/ui/button";

export default function AdminHeader({ rightSlot }: { rightSlot?: React.ReactNode }) {
  return (
    <div className="sticky top-14 z-10 bg-background/70 backdrop-blur border rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        <p className="text-xs text-muted-foreground">Manage questions and daily selection</p>
      </div>
      <div className="flex items-center gap-2">{rightSlot ?? <Button>+ Create Question</Button>}</div>
    </div>
  );
}


