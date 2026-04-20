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
    <div className="admin-page">
      <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ml-2 h-8 text-xs">
        <Link to={backLink}><ChevronLeft className="h-3.5 w-3.5 mr-1" />அத்தியாயங்கள்</Link>
      </Button>

      <div className="admin-page-header">
        <div>
          <h1>{chapter?.title_ta || "..."}</h1>
          <p>{chapter?.books?.title_ta} · {parts.length} பகுதிகள்</p>
        </div>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" />புதிய பகுதி</Button>
      </div>

      <div className="grid gap-2">
        {parts.map((p) => (
          <div key={p.id} className="admin-card">
            <div className="admin-card-num">{p.order_num}</div>
            <div className="flex-1 min-w-0">
              <div className="admin-card-title">{p.title_ta}</div>
              <div className="admin-card-sub">
                {(p.image_urls?.length ?? 0) > 0 && `${p.image_urls.length} 🖼 `}
                {(p.youtube_urls?.length ?? 0) > 0 && `${p.youtube_urls.length} ▶ `}
                {(p.content?.length ?? 0) > 0 && `${Math.round((p.content?.length || 0) / 50) / 10}k chars`}
              </div>
            </div>
            <div className="admin-card-actions">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => confirm("Delete part?") && del.mutate(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
            </div>
          </div>
        ))}
        {parts.length === 0 && <div className="admin-empty">பகுதிகள் இல்லை</div>}
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
