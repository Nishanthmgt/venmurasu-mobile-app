import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, MapPin, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    setEditing({ name: "", description: "", latitude: 0, longitude: 0 });
    setOpen(true);
  };

  const openEdit = (l: MapLocation) => {
    setEditing(l);
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name?.trim()) return toast.error("பெயர் வேண்டும்");
    upsert.mutate(editing);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-primary">வரைபட இடங்கள்</h1>
          <p className="text-sm text-muted-foreground mt-1">{locations.length} இடங்கள் அடையாளப்படுத்தப்பட்டுள்ளன</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> புதிய இடம்
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((l) => (
            <div
              key={l.id}
              className="p-5 rounded-2xl border border-border bg-card hover:shadow-md transition-all flex items-start gap-4 group"
            >
              <div className="h-16 w-16 rounded-xl bg-secondary overflow-hidden shrink-0 border border-border">
                {l.image_url ? (
                  <img src={l.image_url} alt={l.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-accent/40">
                    <MapPin className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-lg text-primary">{l.name}</div>
                <div className="text-xs font-mono text-muted-foreground mt-1 uppercase tracking-tighter">
                  {l.latitude.toFixed(4)}°N, {l.longitude.toFixed(4)}°E
                </div>
                <div className="text-sm text-muted-foreground mt-2 line-clamp-2">{l.description}</div>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => openEdit(l)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { if(confirm(`Delete ${l.name}?`)) del.mutate(l.id); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {locations.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground font-serif bg-secondary/10 rounded-2xl border border-dashed border-border">
              இடங்கள் எதுவும் இல்லை
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editing?.id ? "இடத்தைத் திருத்து" : "புதிய இடம்"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">பெயர் (Location Name)</label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="துவாரகை"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">அட்சரேகை (Latitude)</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={editing.latitude}
                    onChange={(e) => setEditing({ ...editing, latitude: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">தீர்க்கரேகை (Longitude)</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={editing.longitude}
                    onChange={(e) => setEditing({ ...editing, longitude: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">விவரம் (Description)</label>
                <Textarea
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="இந்த இடத்தின் வரலாற்று முக்கியத்துவம்..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">படம் (Image URL)</label>
                <Input
                  value={editing.image_url || ""}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              ரத்து
            </Button>
            <Button onClick={save} disabled={upsert.isPending}>
              {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              சேமி
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMap;
