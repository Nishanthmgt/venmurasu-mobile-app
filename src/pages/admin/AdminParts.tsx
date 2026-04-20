import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { slugify } from "@/lib/admin";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RichEditor } from "@/components/admin/RichEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { YoutubeManager } from "@/components/admin/YoutubeManager";

type Part = {
  id: string;
  chapter_id: string;
  slug: string;
  order_num: number;
  title_ta: string;
  content: string | null;
  image_urls: string[];
  youtube_urls: string[];
};

const AdminParts = () => {
  const { chapterId = "" } = useParams();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Part | null>(null);
  const [open, setOpen] = useState(false);

  const { data: chapter } = useQuery({
    queryKey: ["admin-chapter", chapterId],
    queryFn: async () => {
      const { data, error } = await supabase.from("chapters").select("*, books(title_ta, id)").eq("id", chapterId).maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!chapterId,
  });

  const { data: parts = [] } = useQuery({
    queryKey: ["admin-parts", chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parts")
        .select("*")
        .eq("chapter_id", chapterId)
        .order("order_num");
      if (error) throw error;
      return data as Part[];
    },
    enabled: !!chapterId,
  });

  const upsert = useMutation({
    mutationFn: async (p: Partial<Part>) => {
      if (p.id) {
        const { error } = await supabase.from("parts").update(p).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("parts").insert(p as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-parts", chapterId] });
      qc.invalidateQueries({ queryKey: ["parts", chapterId] });
      toast.success("சேமிக்கப்பட்டது");
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("parts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-parts", chapterId] });
      toast.success("நீக்கப்பட்டது");
    },
  });

  const openNew = () => {
    setEditing({
      id: "",
      chapter_id: chapterId,
      slug: "",
      order_num: (parts[parts.length - 1]?.order_num || 0) + 1,
      title_ta: "",
      content: "",
      image_urls: [],
      youtube_urls: [],
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

  const backLink = chapter?.books?.id ? `/admin/books/${chapter.books.id}/chapters` : "/admin";

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to={backLink}>
          <ChevronLeft className="h-4 w-4" /> அத்தியாயங்கள்
        </Link>
      </Button>

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{chapter?.books?.title_ta}</p>
          <h1 className="font-serif text-3xl text-primary truncate">{chapter?.title_ta || "..."}</h1>
          <p className="text-sm text-muted-foreground mt-1">{parts.length} parts</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> புதிய பகுதி
        </Button>
      </div>

      <div className="grid gap-2">
        {parts.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-secondary/30"
          >
            <div className="w-8 text-center text-sm text-muted-foreground tabular-nums">{p.order_num}</div>
            <div className="flex-1 min-w-0">
              <div className="font-serif text-lg truncate">{p.title_ta}</div>
              <div className="text-xs text-muted-foreground">
                {p.image_urls.length > 0 && `${p.image_urls.length} 🖼 `}
                {p.youtube_urls.length > 0 && `${p.youtube_urls.length} ▶ `}
                {(p.content?.length || 0) > 0 && `${Math.round((p.content?.length || 0) / 100) / 10}k chars`}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true); }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => confirm("Delete part?") && del.mutate(p.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "பகுதி திருத்து" : "புதிய பகுதி"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
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
                <label className="text-xs text-muted-foreground mb-1 block">உள்ளடக்கம்</label>
                <RichEditor value={editing.content || ""} onChange={(html) => setEditing({ ...editing, content: html })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">படங்கள்</label>
                <ImageUploader value={editing.image_urls} onChange={(urls) => setEditing({ ...editing, image_urls: urls })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">YouTube வீடியோக்கள்</label>
                <YoutubeManager value={editing.youtube_urls} onChange={(urls) => setEditing({ ...editing, youtube_urls: urls })} />
              </div>
            </div>
          )}
          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>ரத்து</Button>
            <Button onClick={save} disabled={upsert.isPending}>சேமி</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminParts;
