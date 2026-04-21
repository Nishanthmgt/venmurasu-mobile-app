import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Pencil, Plus, Trash2, Loader2, X } from "lucide-react";
import { slugify } from "@/lib/admin";
import { toast } from "sonner";
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

  const { data: chapter } = useQuery({
    queryKey: ["admin-chapter", chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*, books(title_ta, id)")
        .eq("id", chapterId)
        .maybeSingle();
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
      setEditing(null);
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
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title_ta.trim()) return toast.error("தலைப்பு வேண்டும்");
    const payload: any = { ...editing, slug: editing.slug || slugify(editing.title_ta) };
    if (!payload.id) delete payload.id;
    upsert.mutate(payload);
  };

  const backLink = chapter?.books?.id ? `/admin/books/${chapter.books.id}/chapters` : "/admin";

  // ── Full-page editor view ──
  if (editing) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Editor top bar */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (confirm("Changes will be lost. Close?")) setEditing(null);
            }}
            className="text-muted-foreground hover:text-foreground p-1 rounded"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="font-serif font-semibold text-primary truncate flex-1 text-sm">
            {editing.id ? "பகுதி திருத்து" : "புதிய பகுதி"}
          </span>
          <Button size="sm" onClick={save} disabled={upsert.isPending} className="shrink-0">
            {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            சேமி
          </Button>
        </div>

        {/* Editor body */}
        <div className="flex-1 container max-w-3xl px-4 py-5 space-y-5 pb-24">
          {/* Title + Order */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="admin-label">தலைப்பு *</label>
              <Input
                value={editing.title_ta}
                onChange={(e) => setEditing({ ...editing, title_ta: e.target.value })}
                style={{ fontSize: "16px" }}
                placeholder="பகுதி தலைப்பு"
              />
            </div>
            <div>
              <label className="admin-label">Order</label>
              <Input
                type="number"
                value={editing.order_num}
                onChange={(e) => setEditing({ ...editing, order_num: Number(e.target.value) })}
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="admin-label">Slug</label>
            <Input
              value={editing.slug}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              placeholder="auto-generated"
              style={{ fontSize: "16px" }}
            />
          </div>

          {/* Rich text content — images/videos insert inline here */}
          <div>
            <label className="admin-label mb-2">உள்ளடக்கம் (Content)</label>
            <p className="text-[11px] text-muted-foreground mb-2">
              💡 Toolbar-ல் உள்ள <strong>படம்</strong> / <strong>வீடியோ</strong> button-ஐ press பண்ணி paragraph-க்கு இடையே insert பண்ணலாம்.
            </p>
            <RichEditor
              value={editing.content || ""}
              onChange={(html) => setEditing({ ...editing, content: html })}
            />
          </div>

          {/* Extra images (appendix) */}
          <div>
            <label className="admin-label mb-1">கூடுதல் படங்கள் (Content க்கு கீழே)</label>
            <ImageUploader
              value={editing.image_urls}
              onChange={(urls) => setEditing({ ...editing, image_urls: urls })}
            />
          </div>

          {/* YouTube URLs (appendix) */}
          <div>
            <label className="admin-label mb-1">கூடுதல் YouTube வீடியோக்கள் (Content க்கு கீழே)</label>
            <YoutubeManager
              value={editing.youtube_urls}
              onChange={(urls) => setEditing({ ...editing, youtube_urls: urls })}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Parts list view ──
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
                {(p.image_urls?.length ?? 0) > 0 && `${p.image_urls.length} 🖼 `}
                {(p.youtube_urls?.length ?? 0) > 0 && `${p.youtube_urls.length} ▶ `}
                {(p.content?.length ?? 0) > 0 && `${Math.round((p.content?.length || 0) / 50) / 10}k chars`}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(p)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => confirm("Delete part?") && del.mutate(p.id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {parts.length === 0 && <div className="admin-empty">பகுதிகள் இல்லை</div>}
      </div>
    </div>
  );
};

export default AdminParts;
