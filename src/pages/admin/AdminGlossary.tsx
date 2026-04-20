import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GlossaryTerm = {
  id: string;
  word: string;
  meaning: string;
};

const AdminGlossary = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<GlossaryTerm | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const { data: terms = [], isLoading } = useQuery({
    queryKey: ["admin-glossary"],
    queryFn: async () => {
      const { data, error } = await supabase.from("glossary").select("*").order("word");
      if (error) throw error;
      return data as GlossaryTerm[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (t: Partial<GlossaryTerm>) => {
      if (t.id) {
        const { error } = await supabase.from("glossary").update(t).eq("id", t.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("glossary").insert(t as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-glossary"] });
      qc.invalidateQueries({ queryKey: ["glossary"] });
      toast.success("சேமிக்கப்பட்டது");
      setOpen(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("glossary").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-glossary"] });
      qc.invalidateQueries({ queryKey: ["glossary"] });
      toast.success("நீக்கப்பட்டது");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing({ id: "", word: "", meaning: "" });
    setOpen(true);
  };

  const openEdit = (t: GlossaryTerm) => {
    setEditing(t);
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.word.trim()) return toast.error("சொல் வேண்டும்");
    if (!editing.meaning.trim()) return toast.error("பொருள் வேண்டும்");
    
    const payload: any = { ...editing };
    if (!payload.id) delete payload.id;
    upsert.mutate(payload);
  };

  const filtered = terms.filter(t => 
    t.word.includes(q.trim()) || t.meaning.includes(q.trim())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-primary">கலைச்சொற்கள் நிர்வாகம்</h1>
          <p className="text-sm text-muted-foreground mt-1">{terms.length} சொற்கள் உள்ளன</p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="h-4 w-4" /> புதிய சொல்
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          value={q} 
          onChange={(e) => setQ(e.target.value)} 
          placeholder="சொற்களைத் தேடுங்கள்..." 
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="font-serif text-lg text-primary">{t.word}</div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{t.meaning}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm(`Delete "${t.word}"?`)) del.mutate(t.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground font-serif bg-secondary/20 rounded-xl border border-dashed border-border">
              சொற்கள் எதுவும் இல்லை
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editing?.id ? "சொல்லைத் திருத்து" : "புதிய சொல்"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">சொல் (Word)</label>
                <Input
                  value={editing.word}
                  onChange={(e) => setEditing({ ...editing, word: e.target.value })}
                  placeholder="பந்தனவன்"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">பொருள் (Meaning)</label>
                <Textarea
                  value={editing.meaning}
                  onChange={(e) => setEditing({ ...editing, meaning: e.target.value })}
                  placeholder="கட்டுண்டவன்"
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              ரத்து
            </Button>
            <Button onClick={save} disabled={upsert.isPending}>
              {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              சேமி
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGlossary;
