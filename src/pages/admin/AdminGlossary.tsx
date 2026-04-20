import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type GlossaryTerm = { id: string; word: string; meaning: string; };

const AdminGlossary = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<GlossaryTerm | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const { data: terms = [], isLoading } = useQuery({ queryKey: ["admin-glossary"], queryFn: async () => { const { data, error } = await supabase.from("glossary").select("*").order("word"); if (error) throw error; return data as GlossaryTerm[]; } });

  const upsert = useMutation({
    mutationFn: async (t: Partial<GlossaryTerm>) => {
      if (t.id) { const { error } = await supabase.from("glossary").update(t).eq("id", t.id); if (error) throw error; }
      else { const { error } = await supabase.from("glossary").insert(t as any); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-glossary"] }); qc.invalidateQueries({ queryKey: ["glossary"] }); toast.success("சேமிக்கப்பட்டது"); setOpen(false); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("glossary").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-glossary"] }); qc.invalidateQueries({ queryKey: ["glossary"] }); toast.success("நீக்கப்பட்டது"); },
    onError: (e: any) => toast.error(e.message),
  });

  const openNew = () => { setEditing({ id: "", word: "", meaning: "" }); setOpen(true); };
  const save = () => {
    if (!editing?.word.trim()) return toast.error("சொல் வேண்டும்");
    if (!editing.meaning.trim()) return toast.error("பொருள் வேண்டும்");
    const payload: any = { ...editing };
    if (!payload.id) delete payload.id;
    upsert.mutate(payload);
  };

  const filtered = terms.filter(t => t.word.includes(q.trim()) || t.meaning.includes(q.trim()));

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>கலைச்சொற்கள்</h1>
          <p>{terms.length} சொற்கள்</p>
        </div>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" />புதிய சொல்</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="சொற்களைத் தேடுங்கள்..." className="pl-9 h-9 text-sm" />
      </div>

      {isLoading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div> : (
        <div className="grid gap-2">
          {filtered.map((t) => (
            <div key={t.id} className="admin-card">
              <div className="flex-1 min-w-0">
                <div className="admin-card-title text-primary">{t.word}</div>
                <div className="admin-card-sub line-clamp-1">{t.meaning}</div>
              </div>
              <div className="admin-card-actions">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(t); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => confirm(`Delete "${t.word}"?`) && del.mutate(t.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="admin-empty">சொற்கள் இல்லை</div>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-serif text-base">{editing?.id ? "திருத்து" : "புதிய சொல்"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3 pt-1">
              <div><label className="admin-label">சொல் (Word)</label><Input value={editing.word} onChange={(e) => setEditing({ ...editing, word: e.target.value })} placeholder="பந்தனவன்" /></div>
              <div><label className="admin-label">பொருள் (Meaning)</label><Textarea value={editing.meaning} onChange={(e) => setEditing({ ...editing, meaning: e.target.value })} placeholder="கட்டுண்டவன்" rows={3} /></div>
            </div>
          )}
          <DialogFooter className="mt-3">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>ரத்து</Button>
            <Button size="sm" onClick={save} disabled={upsert.isPending}>{upsert.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}சேமி</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGlossary;
