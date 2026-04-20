import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
}

export const ImageUploader = ({ value, onChange, folder = "parts" }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("book-assets").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("book-assets").getPublicUrl(path);
      onChange([...value, data.publicUrl]);
      toast.success("படம் ஏற்றப்பட்டது");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const addUrl = () => {
    const u = urlInput.trim();
    if (!u) return;
    onChange([...value, u]);
    setUrlInput("");
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {value.map((url, i) => (
          <div key={i} className="relative group rounded-md overflow-hidden border border-border bg-muted aspect-video">
            <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
            <span className="cursor-pointer">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload"}
            </span>
          </Button>
        </label>
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <Input
            placeholder="அல்லது image URL paste பண்ணு"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="h-9"
          />
          <Button type="button" variant="secondary" size="sm" onClick={addUrl}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
