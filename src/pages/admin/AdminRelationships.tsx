import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Users, Loader2, ChevronRight, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Community = {
  id: string;
  name: string;
  description: string | null;
};

type Character = {
  id: string;
  community_id: string;
  parent_id: string | null;
  mother_id: string | null;
  name: string;
  description: string | null;
  order_num: number;
};

const CharacterTree = ({ 
  characters, 
  parentId, 
  onEdit, 
  onDelete, 
  level = 0 
}: { 
  characters: Character[]; 
  parentId: string | null; 
  onEdit: (c: Character) => void;
  onDelete: (id: string) => void;
  level?: number;
}) => {
  const children = characters
    .filter((c) => c.parent_id === parentId)
    .sort((a, b) => a.order_num - b.order_num);

  if (children.length === 0) return null;

  return (
    <div className={`space-y-3 ${level > 0 ? "ml-8 pl-4 border-l-2 border-accent/10" : ""}`}>
      {children.map((char) => (
        <div key={char.id} className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl group hover:border-accent/30 transition-colors shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-accent/60 font-serif text-sm">
                {char.order_num + 1}
              </div>
              <div className="font-serif text-lg">{char.name}</div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => onEdit(char)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(char.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          <CharacterTree 
            characters={characters} 
            parentId={char.id} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            level={level + 1} 
          />
        </div>
      ))}
    </div>
  );
};

const AdminRelationships = () => {
  const qc = useQueryClient();
  const [selectedComm, setSelectedComm] = useState<Community | null>(null);
  
  const [editingComm, setEditingComm] = useState<Partial<Community> | null>(null);
  const [editingChar, setEditingChar] = useState<Partial<Character> | null>(null);
  
  const [openComm, setOpenComm] = useState(false);
  const [openChar, setOpenChar] = useState(false);

  const { data: communities = [], isLoading: loadComm } = useQuery({
    queryKey: ["admin-communities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("communities").select("*").order("name");
      if (error) throw error;
      return data as Community[];
    },
  });

  const { data: characters = [], isLoading: loadChar } = useQuery({
    queryKey: ["admin-characters", selectedComm?.id],
    queryFn: async () => {
      if (!selectedComm) return [];
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("community_id", selectedComm.id)
        .order("order_num");
      if (error) throw error;
      return data as Character[];
    },
    enabled: !!selectedComm,
  });

  const upsertComm = useMutation({
    mutationFn: async (c: Partial<Community>) => {
      const { data, error } = c.id 
        ? await supabase.from("communities").update(c).eq("id", c.id).select().single()
        : await supabase.from("communities").insert(c as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-communities"] });
      qc.invalidateQueries({ queryKey: ["communities"] });
      toast.success("சமூகம் சேமிக்கப்பட்டது");
      setOpenComm(false);
      setEditingComm(null);
      if (data) setSelectedComm(data);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const upsertChar = useMutation({
    mutationFn: async (c: Partial<Character>) => {
      if (c.id) {
        const { error } = await supabase.from("characters").update(c).eq("id", c.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("characters").insert(c as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-characters", selectedComm?.id] });
      qc.invalidateQueries({ queryKey: ["characters", selectedComm?.id] });
      toast.success("கதாபாத்திரம் சேமிக்கப்பட்டது");
      setOpenChar(false);
      setEditingChar(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const delComm = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("communities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-communities"] });
      setSelectedComm(null);
      toast.success("சமூகம் நீக்கப்பட்டது");
    },
  });

  const delChar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("characters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-characters", selectedComm?.id] });
      toast.success("கதாபாத்திரம் நீக்கப்பட்டது");
    },
  });

  const openNewComm = () => {
    setEditingComm({ name: "", description: "" });
    setOpenComm(true);
  };

  const openNewChar = () => {
    if (!selectedComm) return;
    setEditingChar({ 
      community_id: selectedComm.id, 
      name: "", 
      description: "", 
      parent_id: null,
      mother_id: null,
      order_num: characters.length
    });
    setOpenChar(true);
  };

  if (loadComm) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Communities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-primary">சமூகங்கள்</h2>
          <Button size="icon" variant="ghost" onClick={openNewComm}><Plus className="h-5 w-5" /></Button>
        </div>
        <div className="space-y-2">
          {communities.map((c) => (
            <div 
              key={c.id}
              onClick={() => setSelectedComm(c)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${selectedComm?.id === c.id ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-card border-border hover:border-accent/40'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Users className={`h-5 w-5 shrink-0 ${selectedComm?.id === c.id ? 'text-primary-foreground' : 'text-accent'}`} />
                <span className="font-serif truncate">{c.name}</span>
              </div>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-inherit" 
                  onClick={(e) => { e.stopPropagation(); setEditingComm(c); setOpenComm(true); }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-inherit hover:text-destructive" 
                  onClick={(e) => { e.stopPropagation(); if(confirm(`Delete ${c.name}?`)) delComm.mutate(c.id); }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Characters */}
      <div className="lg:col-span-2 space-y-4">
        {!selectedComm ? (
          <div className="h-full flex flex-col items-center justify-center p-12 bg-secondary/10 rounded-3xl border border-dashed border-border text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-serif">நிர்வகிக்க ஒரு சமூகத்தைத் தேர்ந்தெடுக்கவும்</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-card p-6 rounded-2xl border border-border">
              <div>
                <h2 className="font-serif text-2xl text-primary">{selectedComm.name} - கதாபாத்திரங்கள்</h2>
                <p className="text-sm text-muted-foreground mt-1">{characters.length} நபர்கள் உள்ளார்கள்</p>
              </div>
              <Button onClick={openNewChar} className="gap-2">
                <UserPlus className="h-4 w-4" /> சேர்க்க
              </Button>
            </div>

            {loadChar ? (
              <div className="flex justify-center p-20"><Loader2 className="animate-spin text-accent" /></div>
            ) : (
              <div className="space-y-4">
                <CharacterTree 
                  characters={characters} 
                  parentId={null} 
                  onEdit={(c) => { setEditingChar(c); setOpenChar(true); }}
                  onDelete={(id) => { if(confirm(`Delete character?`)) delChar.mutate(id); }}
                />
                {characters.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground font-serif bg-secondary/5 rounded-2xl border border-dashed border-border/50">
                    இன்னும் கதாபாத்திரங்கள் சேர்க்கப்படவில்லை
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Community Dialog */}
      <Dialog open={openComm} onOpenChange={setOpenComm}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif">சமூகத் தகவல்</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">பெயர் (Name)</label>
              <Input value={editingComm?.name || ""} onChange={e => setEditingComm({...editingComm!, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">விவரம் (Description)</label>
              <Textarea value={editingComm?.description || ""} onChange={e => setEditingComm({...editingComm!, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenComm(false)}>ரத்து</Button>
            <Button onClick={() => upsertComm.mutate(editingComm!)} disabled={upsertComm.isPending}>சேமி</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Character Dialog */}
      <Dialog open={openChar} onOpenChange={setOpenChar}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif">கதாபாத்திரத் தகவல்</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">பெயர் (Name)</label>
              <Input value={editingChar?.name || ""} onChange={e => setEditingChar({...editingChar!, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">தந்தை (Father / Parent)</label>
              <Select 
                value={editingChar?.parent_id || "none"} 
                onValueChange={v => setEditingChar({...editingChar!, parent_id: v === "none" ? null : v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="தந்தையைத் தேர்ந்தெடுக்கவும்" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">யாருமில்லை (Root)</SelectItem>
                  {characters.filter(c => c.id !== editingChar?.id).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">தாய் (Mother)</label>
              <Select 
                value={editingChar?.mother_id || "none"} 
                onValueChange={v => setEditingChar({...editingChar!, mother_id: v === "none" ? null : v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="தாயைத் தேர்ந்தெடுக்கவும்" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">யாருமில்லை</SelectItem>
                  {characters.filter(c => c.id !== editingChar?.id).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">வரிசை (Order)</label>
                <Input type="number" value={editingChar?.order_num || 0} onChange={e => setEditingChar({...editingChar!, order_num: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">விவரம்</label>
              <Textarea value={editingChar?.description || ""} onChange={e => setEditingChar({...editingChar!, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenChar(false)}>ரத்து</Button>
            <Button onClick={() => upsertChar.mutate(editingChar!)} disabled={upsertChar.isPending}>சேமி</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRelationships;
