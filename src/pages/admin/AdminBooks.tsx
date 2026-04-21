import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, BookOpen, ChevronRight, Loader2, Upload } from "lucide-react";
import { slugify } from "@/lib/admin";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";

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
  const [uploading, setUploading] = useState(false);

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
      toast.success("நீக்கப்பட்டது");
    },
  });

  const handleCoverUpload = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    try {
      const path = `covers/${Date.now()}.${file.name.split(".").pop() || "jpg"}`;
      const { error } = await supabase.storage.from("book-assets").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("book-assets").getPublicUrl(path);
      setEditing({ ...editing, cover_image_url: data.publicUrl });
      toast.success("படம் ஏற்றப்பட்டது");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const openNew = () => {
    setEditing({
      title_ta: "",
      title_en: "",
      subtitle: "",
      description: "",
      cover_image_url: "",
      order_num: books.length + 1,
    });
    setOpen(true);
  };

  const save = () => {
    if (!editing?.title_ta?.trim()) return toast.error("தமிழ் தலைப்பு வேண்டும்");
    const payload: any = { ...editing, slug: editing.slug || slugify(editing.title_ta!) };
    if (!payload.id) delete payload.id;
    upsert.mutate(payload);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>நூல்கள்</h1>
          <p>{books.length} நூல்கள்</p>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          புதிய நூல்
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid gap-2">
          {books.map((b) => (
            <div key={b.id} className="admin-card">
              <div className="h-12 w-9 rounded-md bg-secondary overflow-hidden shrink-0 border border-border">
                {b.cover_image_url ? (
                  <img src={b.cover_image_url} alt={b.title_ta} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-accent/40">
                    <BookOpen className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="admin-card-title">{b.title_ta}</div>
                {b.subtitle && <div className="admin-card-sub">{b.subtitle}</div>}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => { setEditing(b); setOpen(true); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => confirm("Delete?") && del.mutate(b.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <Button asChild variant="ghost" size="sm" className="shrink-0 text-xs h-8">
                <Link to={`/admin/books/${b.id}/chapters`}>
                  அத்தியாயங்கள் <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          ))}
          {books.length === 0 && (
            <div className="admin-empty">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-20" />
              நூல்கள் இல்லை
            </div>
          )}
        </div>
      )}

      {/* ── Bottom Sheet (keyboard-safe on mobile) ── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-4 pb-safe max-h-[92dvh] overflow-y-auto"
        >
          <SheetHeader className="pb-3 border-b border-border/40">
            <SheetTitle className="font-serif text-base text-primary">
              {editing?.id ? "நூலை திருத்து" : "புதிய நூல்"}
            </SheetTitle>
          </SheetHeader>

          {editing && (
            <div className="space-y-4 pt-4">
              {/* Tamil & English titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">தமிழ் தலைப்பு *</label>
                  <Input
                    value={editing.title_ta || ""}
                    onChange={(e) => setEditing({ ...editing, title_ta: e.target.value })}
                    placeholder="வெண்முரசு"
                    className="text-base"
                    style={{ fontSize: "16px" /* prevent iOS zoom */ }}
                  />
                </div>
                <div>
                  <label className="admin-label">English Title</label>
                  <Input
                    value={editing.title_en || ""}
                    onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}
                    placeholder="Venmurasu"
                    style={{ fontSize: "16px" }}
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="admin-label">Subtitle</label>
                <Input
                  value={editing.subtitle || ""}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                  style={{ fontSize: "16px" }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="admin-label">விவரம்</label>
                <Textarea
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  style={{ fontSize: "16px" }}
                />
              </div>

              {/* Cover image */}
              <div>
                <label className="admin-label">முகப்பு படம்</label>
                <div className="flex gap-3 items-start">
                  {/* Preview */}
                  <div className="h-20 w-14 rounded-lg bg-secondary border overflow-hidden shrink-0">
                    {editing.cover_image_url ? (
                      <img src={editing.cover_image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-accent/30">
                        <BookOpen className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    {/* File upload */}
                    <label>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleCoverUpload(f);
                          e.target.value = "";
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        asChild
                        className="w-full h-9 text-sm"
                      >
                        <span className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-1" />
                          {uploading ? "Uploading..." : "படம் Upload"}
                        </span>
                      </Button>
                    </label>
                    {/* URL input */}
                    <Input
                      value={editing.cover_image_url || ""}
                      onChange={(e) => setEditing({ ...editing, cover_image_url: e.target.value })}
                      placeholder="அல்லது URL paste பண்ணு"
                      className="text-xs h-9"
                      style={{ fontSize: "16px" }}
                    />
                  </div>
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="admin-label">Order</label>
                <Input
                  type="number"
                  value={editing.order_num || 1}
                  onChange={(e) => setEditing({ ...editing, order_num: Number(e.target.value) })}
                  className="w-24"
                  style={{ fontSize: "16px" }}
                />
              </div>
            </div>
          )}

          <SheetFooter className="mt-5 flex-row gap-2 pb-2">
            <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
              ரத்து
            </Button>
            <Button
              className="flex-1"
              onClick={save}
              disabled={upsert.isPending || uploading}
            >
              {upsert.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              சேமி
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminBooks;
