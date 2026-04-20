import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { slugify } from "@/lib/admin";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Chapter = { id: string; book_id: string; slug: string; order_num: number; title_ta: string; description: string | null; published_at: string | null; };

const AdminChapters = () => {
  const { bookId = "" } = useParams();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Chapter | null>(null);
  const [open, setOpen] = useState(false);

  const { data: book } = useQuery({ queryKey: ["admin-book", bookId], queryFn: async () => { const { data, error } = await supabase.from("books").select("*").eq("id", bookId).maybeSingle(); if (error) throw error; return data; }, enabled: !!bookId });
  const { data: chapters = [], isLoading } = useQuery({ queryKey: ["admin-chapters", bookId], queryFn: async () => { const { data, error } = await supabase.from("chapters").select("*").eq("book_id", bookId).order("order_num"); if (error) throw error; return data as Chapter[]; }, enabled: !!bookId });

  const upsert = useMutation({
    mutationFn: async (c: Partial<Chapter>) => {
      if (c.id) { const { error } = await supabase.from("chapters").update(c).eq("id", c.id); if (error) throw error; }
      else { const { error } = await supabase.from("chapters").insert(c as any); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-chapters", bookId] }); qc.invalidateQueries({ queryKey: ["chapters", bookId] }); toast.success("சேமிக்கப்பட்டது"); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("chapters").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-chapters", bookId] }); toast.success("நீக்கப்பட்டது"); },
  });

  const openNew = () => { setEditing({ id: "", book_id: bookId, slug: "", order_num: (chapters[chapters.length - 1]?.order_num || 0) + 1, title_ta: "", description: "", published_at: new Date().toISOString().slice(0, 10) }); setOpen(true); };
  const save = () => {
    if (!editing?.title_ta.trim()) return toast.error("தலைப்பு வேண்டும்");
    const payload: any = { ...editing, slug: editing.slug || slugify(editing.title_ta) };
    if (!payload.id) delete payload.id;
    upsert.mutate(payload);
  };

  return (
    <div className="admin-page">
      <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ml-2 h-8 text-xs">
        <Link to="/admin"><ChevronLeft className="h-3.5 w-3.5 mr-1" />நூல்கள்</Link>
      </Button>

      <div className="admin-page-header">
        <div>
          <h1>{book?.title_ta || "..."}</h1>
          <p>{chapters.length} அத்தியாயங்கள்</p>
        </div>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" />புதியது</Button>
      </div>

      {isLoading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div> : (
        <div className="grid gap-2">
          {chapters.map((c) => (
            <div key={c.id} className="admin-card">
              <div className="admin-card-num">{c.order_num}</div>
              <div className="flex-1 min-w-0">
                <div className="admin-card-title">{c.title_ta}</div>
                {c.published_at && <div className="admin-card-sub">{c.published_at}</div>}
              </div>
              <div className="admin-card-actions">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => confirm("Delete?") && del.mutate(c.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
              <Button asChild variant="ghost" size="sm" className="shrink-0 text-xs h-8">
                <Link to={`/admin/chapters/${c.id}/parts`}>பகுதிகள் <ChevronRight className="h-3.5 w-3.5 ml-1" /></Link>
              </Button>
            </div>
          ))}
          {chapters.length === 0 && <div className="admin-empty">அத்தியாயங்கள் இல்லை</div>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-serif text-base">{editing?.id ? "திருத்து" : "புதிய அத்தியாயம்"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2"><label className="admin-label">தலைப்பு *</label><Input value={editing.title_ta} onChange={(e) => setEditing({ ...editing, title_ta: e.target.value })} /></div>
                <div><label className="admin-label">Order</label><Input type="number" value={editing.order_num} onChange={(e) => setEditing({ ...editing, order_num: Number(e.target.value) })} /></div>
              </div>
              <div><label className="admin-label">Slug</label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="auto" /></div>
              <div><label className="admin-label">தேதி</label><Input type="date" value={editing.published_at || ""} onChange={(e) => setEditing({ ...editing, published_at: e.target.value || null })} /></div>
              <div><label className="admin-label">விவரம்</label><Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} /></div>
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

export default AdminChapters;
