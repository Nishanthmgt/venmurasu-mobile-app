import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Youtube } from "lucide-react";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
}

export const YoutubeManager = ({ value, onChange }: Props) => {
  const [input, setInput] = useState("");
  const add = () => {
    const u = input.trim();
    if (!u) return;
    onChange([...value, u]);
    setInput("");
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {value.map((url, i) => (
        <div key={i} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
          <Youtube className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-sm truncate flex-1">{url}</span>
          <button type="button" onClick={() => remove(i)} aria-label="Remove">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input placeholder="https://youtube.com/watch?v=..." value={input} onChange={(e) => setInput(e.target.value)} />
        <Button type="button" variant="secondary" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
