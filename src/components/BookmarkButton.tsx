import { useEffect, useState } from "react";
import { Bookmark as BIcon } from "lucide-react";
import { isBookmarked, toggleBookmark, type Bookmark } from "@/data/venmurasu";
import { toast } from "@/hooks/use-toast";

export const BookmarkButton = ({ data }: { data: Omit<Bookmark, "at"> }) => {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(isBookmarked(data.id)); }, [data.id]);
  return (
    <button
      onClick={() => {
        const added = toggleBookmark({ ...data, at: Date.now() });
        setOn(added);
        toast({ title: added ? "சேமிக்கப்பட்டது" : "நீக்கப்பட்டது", description: data.title });
      }}
      className="p-2 rounded-md hover:bg-secondary text-muted-foreground"
      aria-label="அடையாளம் இடு"
    >
      <BIcon className={`h-5 w-5 ${on ? "fill-accent text-accent" : ""}`} />
    </button>
  );
};
