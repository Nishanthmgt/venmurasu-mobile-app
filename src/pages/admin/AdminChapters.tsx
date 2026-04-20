import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { slugify } from "@/lib/admin";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Chapter = {
  id: string;
  book_id: string;
  slug: string;
  order_num: number;
  title_ta: string;
  description: string | null;
  published_at: string | null;
};

const AdminChapters = () => {
  const { bookId = "" } = useParams();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Chapter | null>(null);
  const [open, setOpen] = useState(false);

  const { data: book } = useQuery({
    queryKey: ["admin-book", bookId],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*").eq("id", bookId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!bookId,
  });

  const { data: chapters = [] } = useQuery({
    queryKey: ["admin-chapters", bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("book_id", bookId)
        .order("order_num");
      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!bookId,
  });

  const upsert = useMutation({
    mutationFn: async (c: Partial<Chapter>) => {
      if (c.id) {
        const { error } = await supabase.from("chapters").update(c).eq("id", c.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("chapters").insert(c as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-chapters", bookId] });
      qc.invalidateQueries({ queryKey: ["chapters", bookId] });
      toast.success("சேமிக்கப்பட்டது");
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chapters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-chapters", bookId] });
      toast.success("நீக்கப்பட்டது");
    },
  });

  const openNew = () => {
    setEditing({
      id: "",
      book_id: bookId,
      slug: "",
      order_num: (chapters[chapters.length - 1]?.order_num || 0) + 1,
      title_ta: "",
      description: "",
      published_at: new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title_ta.trim()) return toast.error("தலைப்பு வேண்டும்");
    const payload: any = { ...editing, slug: editing.slug || slugify(editing.title_ta) };
    if (!payload.id) delete payload.id;
    upsert.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin">
          <ChevronLeft className="h-4 w-4" /> புத்தகங்கள்
        </Link>
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-primary">{book?.title_ta || "..."}</h1>
          <p className="text-sm text-muted-foreground mt-1">{chapters.length} chapters</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> புதிய அத்தியாயம்
        </Button>
      </div>

      <div className="grid gap-2">
        {chapters.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-secondary/30"
          >
            <div className="w-8 text-center text-sm text-muted-foreground tabular-nums">{c.order_num}</div>
            <div className="flex-1 min-w-0">
              <div className="font-serif text-lg truncate">{c.title_ta}</div>
              <div className="text-xs text-muted-foreground truncate">
                /{c.slug}
                {c.published_at && <span className="ml-2">· {c.published_at}</span>}
              </div>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to={`/admin/chapters/${c.id}/parts`}>
                பகுதிகள் <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => confirm("Delete chapter?") && del.mutate(c.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "திருத்து" : "புதிய அத்தியாயம்"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">தலைப்பு</label>
                  <Input value={editing.title_ta} onChange={(e) => setEditing({ ...editing, title_ta: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Order</label>
                  <Input
                    type="number"
                    value={editing.order_num}
                    onChange={(e) => setEditing({ ...editing, order_num: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Slug</label>
                <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Updated date (chapters-ku date)</label>
                <Input
                  type="date"
                  value={editing.published_at || ""}
                  onChange={(e) => setEditing({ ...editing, published_at: e.target.value || null })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Description</label>
                <Textarea
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>ரத்து</Button>
            <Button onClick={save} disabled={upsert.isPending}>சேமி</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChapters;
