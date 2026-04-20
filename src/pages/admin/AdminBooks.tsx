import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { slugify } from "@/lib/admin";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  const [editing, setEditing] = useState<Book | null>(null);
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
      qc.invalidateQueries({ queryKey: ["books"] });
      toast.success("சேமிக்கப்பட்டது");
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
      qc.invalidateQueries({ queryKey: ["books"] });
      toast.success("நீக்கப்பட்டது");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing({
      id: "",
      slug: "",
      order_num: (books[books.length - 1]?.order_num || 0) + 1,
      title_ta: "",
      title_en: "",
      subtitle: "",
      description: "",
      cover_image_url: "",
    } as Book);
    setOpen(true);
  };

  const openEdit = (b: Book) => {
    setEditing(b);
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title_ta.trim()) return toast.error("தலைப்பு வேண்டும்");
    const payload: any = {
      ...editing,
      slug: editing.slug || slugify(editing.title_en || editing.title_ta),
    };
    if (!payload.id) delete payload.id;
    upsert.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-primary">புத்தகங்கள்</h1>
          <p className="text-sm text-muted-foreground mt-1">{books.length} books</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> புதிய புத்தகம்
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-2">
          {books.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors"
            >
              <div className="w-8 text-center text-sm text-muted-foreground tabular-nums">{b.order_num}</div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-lg text-foreground truncate">{b.title_ta}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {b.title_en} · /{b.slug}
                </div>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/admin/books/${b.id}/chapters`}>
                  அத்தியாயங்கள் <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm(`Delete "${b.title_ta}"? Chapters/parts will be orphaned.`)) del.mutate(b.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "புத்தகம் திருத்து" : "புதிய புத்தகம்"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">தலைப்பு (Tamil)</label>
                  <Input
                    value={editing.title_ta}
                    onChange={(e) => setEditing({ ...editing, title_ta: e.target.value })}
                  />
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
                <label className="text-xs text-muted-foreground">Title (English)</label>
                <Input
                  value={editing.title_en || ""}
                  onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Slug</label>
                <Input
                  value={editing.slug}
                  placeholder="auto from English title"
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Subtitle</label>
                <Input
                  value={editing.subtitle || ""}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Description</label>
                <Textarea
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Cover image URL</label>
                <Input
                  value={editing.cover_image_url || ""}
                  onChange={(e) => setEditing({ ...editing, cover_image_url: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              ரத்து
            </Button>
            <Button onClick={save} disabled={upsert.isPending}>
              சேமி
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBooks;
