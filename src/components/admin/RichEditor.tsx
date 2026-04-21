import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3, Quote,
  Undo2, Redo2, ImageIcon, YoutubeIcon, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export const RichEditor = ({ value, onChange }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [ytUrl, setYtUrl] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm md:prose-base max-w-none min-h-[280px] focus:outline-none px-4 py-3 font-serif leading-relaxed text-foreground",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  // ── Upload image file → Supabase → insert into editor ──
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `parts/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error } = await supabase.storage
        .from("book-assets")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("book-assets").getPublicUrl(path);
      editor.chain().focus().setImage({ src: data.publicUrl, alt: file.name }).run();
      toast.success("படம் சேர்க்கப்பட்டது");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ── Insert image by URL ──
  const insertImageUrl = () => {
    const u = imgUrl.trim();
    if (!u) return;
    editor.chain().focus().setImage({ src: u }).run();
    setImgUrl("");
  };

  // ── Extract YouTube ID and insert iframe ──
  const insertYoutube = () => {
    const u = ytUrl.trim();
    if (!u) return;
    const m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    const id = m ? m[1] : null;
    if (!id) { toast.error("YouTube URL சரியில்லை"); return; }
    const iframe = `<div class="yt-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:1rem 0"><iframe src="https://www.youtube.com/embed/${id}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"></iframe></div>`;
    editor.chain().focus().insertContent(iframe).run();
    setYtUrl("");
    toast.success("வீடியோ சேர்க்கப்பட்டது");
  };

  const Btn = ({
    onClick, active, children, label, disabled,
  }: {
    onClick: () => void; active?: boolean; children: React.ReactNode; label: string; disabled?: boolean;
  }) => (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <div className="rounded-md border border-input bg-background">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap gap-1 border-b border-border p-2 bg-muted/30">
        {/* Text formatting */}
        <Btn label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn label="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn label="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </Btn>
        <Btn label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Btn>
        <Btn label="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </Btn>

        <div className="w-px h-6 bg-border mx-1 self-center" />

        {/* ── Image Insert ── */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Insert image"
              disabled={uploading}
              className="h-8 px-2 gap-1 text-xs"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              <span className="hidden sm:inline">படம்</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 space-y-2" align="start">
            <p className="text-xs font-semibold text-muted-foreground">படம் சேர்</p>
            {/* Upload from device */}
            <label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f);
                  e.target.value = "";
                }}
              />
              <Button type="button" variant="outline" size="sm" className="w-full" asChild>
                <span className="cursor-pointer" onClick={() => fileRef.current?.click()}>
                  <ImageIcon className="h-3.5 w-3.5 mr-1" />
                  Device-இல் இருந்து
                </span>
              </Button>
            </label>
            {/* Insert by URL */}
            <div className="flex gap-1">
              <Input
                placeholder="Image URL"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                className="h-8 text-xs flex-1"
                onKeyDown={(e) => e.key === "Enter" && insertImageUrl()}
              />
              <Button type="button" size="sm" variant="secondary" onClick={insertImageUrl} className="h-8 px-2">
                OK
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* ── YouTube Insert ── */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" aria-label="Insert YouTube" className="h-8 px-2 gap-1 text-xs">
              <YoutubeIcon className="h-4 w-4 text-red-500" />
              <span className="hidden sm:inline">வீடியோ</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 space-y-2" align="start">
            <p className="text-xs font-semibold text-muted-foreground">YouTube வீடியோ சேர்</p>
            <div className="flex gap-1">
              <Input
                placeholder="YouTube URL"
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                className="h-8 text-xs flex-1"
                onKeyDown={(e) => e.key === "Enter" && insertYoutube()}
              />
              <Button type="button" size="sm" variant="secondary" onClick={insertYoutube} className="h-8 px-2">
                OK
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Undo/Redo */}
        <div className="ml-auto flex gap-1">
          <Btn label="Undo" onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="h-4 w-4" />
          </Btn>
          <Btn label="Redo" onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" />
          </Btn>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};
