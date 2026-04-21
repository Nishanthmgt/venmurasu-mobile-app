import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, MapPin, Loader2, Image as ImageIcon, FileText } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";

type ContentMode = "image_only" | "content_with_image";

type MapLocation = {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  image_url: string | null;
};

const AdminMap = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<MapLocation> | null>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ContentMode>("content_with_image");

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["admin-map-locations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("map_locations").select("*").order("name");
      if (error) throw error;
      return data as MapLocation[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (l: Partial<MapLocation>) => {
      if (l.id) {
        const { error } = await supabase.from("map_locations").update(l).eq("id", l.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("map_locations").insert(l as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-map-locations"] });
      qc.invalidateQueries({ queryKey: ["map-locations"] });
      toast.success("இடம் சேமிக்கப்பட்டது");
      setOpen(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("map_locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-map-locations"] });
      qc.invalidateQueries({ queryKey: ["map-locations"] });
      toast.success("இடம் நீக்கப்பட்டது");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing({ name: "", description: "", latitude: 0, longitude: 0, image_url: "" });
    setMode("content_with_image");
    setOpen(true);
  };

  const openEdit = (l: MapLocation) => {
    setEditing(l);
    // Auto-detect mode: if no description → image_only
    setMode(!l.description?.trim() ? "image_only" : "content_with_image");
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name?.trim()) return toast.error("பெயர் வேண்டும்");
    // If image_only mode, clear description
    const payload = mode === "image_only"
      ? { ...editing, description: null }
      : editing;
    upsert.mutate(payload);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>வரைபட இடங்கள்</h1>
          <p>{locations.length} இடங்கள்</p>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          புதிய இடம்
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid gap-2">
          {locations.map((l) => (
            <div key={l.id} className="admin-card">
              <div className="h-12 w-12 rounded-lg bg-secondary overflow-hidden shrink-0 border border-border">
                {l.image_url ? (
                  <img src={l.image_url} alt={l.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-accent/40">
                    <MapPin className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="admin-card-title">{l.name}</div>
                <div className="admin-card-sub flex items-center gap-2">
                  <span>{l.latitude.toFixed(2)}°N, {l.longitude.toFixed(2)}°E</span>
                  {l.description ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary rounded px-1 py-0.5">
                      <FileText className="h-2.5 w-2.5" /> விவரம்
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[10px] bg-secondary text-muted-foreground rounded px-1 py-0.5">
                      <ImageIcon className="h-2.5 w-2.5" /> படம்
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(l)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => { if (confirm(`Delete ${l.name}?`)) del.mutate(l.id); }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {locations.length === 0 && <div className="admin-empty">இடங்கள் இல்லை</div>}
        </div>
      )}

      {/* ── Bottom Sheet ── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-4 pb-safe max-h-[92dvh] overflow-y-auto"
        >
          <SheetHeader className="pb-3 border-b border-border/40">
            <SheetTitle className="font-serif text-base text-primary">
              {editing?.id ? "இடத்தை திருத்து" : "புதிய இடம்"}
            </SheetTitle>
          </SheetHeader>

          {editing && (
            <div className="space-y-4 pt-4">
              {/* Location name */}
              <div>
                <label className="admin-label">பெயர் (Location Name) *</label>
                <Input
                  value={editing.name || ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="துவாரகை"
                  style={{ fontSize: "16px" }}
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">அட்சரேகை (Lat)</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={editing.latitude ?? 0}
                    onChange={(e) => setEditing({ ...editing, latitude: parseFloat(e.target.value) })}
                    style={{ fontSize: "16px" }}
                  />
                </div>
                <div>
                  <label className="admin-label">தீர்க்கரேகை (Lng)</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={editing.longitude ?? 0}
                    onChange={(e) => setEditing({ ...editing, longitude: parseFloat(e.target.value) })}
                    style={{ fontSize: "16px" }}
                  />
                </div>
              </div>

              {/* ── Content Type Toggle ── */}
              <div>
                <label className="admin-label">வகை (Content Type)</label>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setMode("image_only")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                      mode === "image_only"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <ImageIcon className="h-4 w-4" />
                    படம் மட்டும்
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("content_with_image")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                      mode === "content_with_image"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    படம் + விவரம்
                  </button>
                </div>
              </div>

              {/* Image URL — always shown */}
              <div>
                <label className="admin-label">படம் (Image URL)</label>
                <Input
                  value={editing.image_url || ""}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                  placeholder="https://..."
                  style={{ fontSize: "16px" }}
                />
                {editing.image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-border h-32">
                    <img
                      src={editing.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                )}
              </div>

              {/* Description — only in content_with_image mode */}
              {mode === "content_with_image" && (
                <div>
                  <label className="admin-label">விவரம் (Description)</label>
                  <Textarea
                    value={editing.description || ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    placeholder="இந்த இடத்தின் வரலாற்று முக்கியத்துவம்..."
                    rows={4}
                    style={{ fontSize: "16px" }}
                  />
                </div>
              )}
            </div>
          )}

          <SheetFooter className="mt-5 flex-row gap-2 pb-2">
            <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
              ரத்து
            </Button>
            <Button className="flex-1" onClick={save} disabled={upsert.isPending}>
              {upsert.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              சேமி
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminMap;
