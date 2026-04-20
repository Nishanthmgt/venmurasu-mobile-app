import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { slugify } from "@/lib/admin";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type Book = {
  id: string;
  slug: string;
  order_num: number;
  title_ta: string;
  title_en: string | null;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
};

const AdminBooks = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Book> | null>(null);
  const [open, setOpen] = useState(false);

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["admin-books"],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*").order("order_num");
      if (error) throw error;
      return data as Book[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (b: Partial<Book>) => {
      if (b.id) {
        const { error } = await supabase.from("books").update(b).eq("id", b.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("books").insert(b as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-books"] });
      toast.success("நூல் சேமிக்கப்பட்டது");
      setOpen(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-books"] });
      toast.success("நூல் நீக்கப்பட்டது");
    },
  });

  const openNew = () => {
    setEditing({ title_ta: "", title_en: "", subtitle: "", description: "", cover_image_url: "", order_num: books.length + 1 });
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title_ta?.trim()) return toast.error("தமிழ் தலைப்பு வேண்டும்");
    const payload: any = { ...editing, slug: editing.slug || slugify(editing.title_ta!) };
    if (!payload.id) delete payload.id;
    upsert.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary">நூல்கள்</h1>
          <p className="text-sm text-muted-foreground mt-1">{books.length} நூல்கள் உள்ளன</p>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> புதிய நூல்
        </Button>
      </div>

      {/* Books List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid gap-3">
          {books.map((b) => (
            <div key={b.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all group">
              <div className="h-14 w-10 rounded-lg bg-secondary overflow-hidden shrink-0 border border-border">
                {b.cover_image_url ? (
                  <img src={b.cover_image_url} alt={b.title_ta} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-accent/40">
                    <BookOpen className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-lg text-foreground">{b.title_ta}</div>
                {b.subtitle && <div className="text-xs text-muted-foreground">{b.subtitle}</div>}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(b); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => confirm("Delete?") && del.mutate(b.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <Button asChild variant="ghost" size="icon">
                <Link to={`/admin/books/${b.id}/chapters`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
          {books.length === 0 && (
            <div className="text-center py-20 text-muted-foreground font-serif bg-secondary/10 rounded-2xl border border-dashed border-border">
              இன்னும் நூல்கள் சேர்க்கப்படவில்லை
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">{editing?.id ? "நூலை திருத்து" : "புதிய நூல்"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">தமிழ் தலைப்பு *</label>
                  <Input value={editing.title_ta || ""} onChange={(e) => setEditing({ ...editing, title_ta: e.target.value })} placeholder="வெண்முரசு" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">English Title</label>
                  <Input value={editing.title_en || ""} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} placeholder="Venmurasu" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Subtitle</label>
                <Input value={editing.subtitle || ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">விவரம்</label>
                <Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Cover Image URL</label>
                  <Input value={editing.cover_image_url || ""} onChange={(e) => setEditing({ ...editing, cover_image_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Order</label>
                  <Input type="number" value={editing.order_num || 1} onChange={(e) => setEditing({ ...editing, order_num: Number(e.target.value) })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>ரத்து</Button>
            <Button onClick={save} disabled={upsert.isPending}>
              {upsert.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}சேமி
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBooks;
