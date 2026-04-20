import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { getBookmarks, toggleBookmark, type Bookmark } from "@/data/venmurasu";
import { Bookmark as BIcon, Trash2 } from "lucide-react";

const KIND_LABEL: Record<Bookmark["kind"], string> = {
  book: "நூல்",
  topic: "அத்தியாயம்",
  part: "பகுதி",
  word: "சொல்",
};

const Bookmarks = () => {
  const [list, setList] = useState<Bookmark[]>([]);
  useEffect(() => { setList(getBookmarks()); }, []);

  const remove = (b: Bookmark) => {
    toggleBookmark(b);
    setList(getBookmarks());
  };

  return (
    <div className="min-h-screen pb-16">
      <PageHeader title="அடையாளங்கள்" back="/" />
      <main className="container max-w-2xl px-4 mt-6">
        {list.length === 0 ? (
          <div className="text-center mt-16 text-muted-foreground font-serif">
            <BIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
            இன்னும் எதையும் சேமிக்கவில்லை
          </div>
        ) : (
          <ul className="paper-card rounded-lg divide-y divide-border overflow-hidden">
            {list.map((b) => (
              <li key={b.id} className="flex items-center gap-3 px-4 py-3">
                <Link to={b.href} className="flex-1 min-w-0">
                  <div className="text-[11px] text-accent font-serif uppercase tracking-wider">{KIND_LABEL[b.kind]}</div>
                  <div className="font-serif text-foreground truncate">{b.title}</div>
                  {b.subtitle && <div className="text-sm text-muted-foreground font-serif truncate">{b.subtitle}</div>}
                </Link>
                <button
                  onClick={() => remove(b)}
                  className="p-2 rounded-md hover:bg-secondary text-muted-foreground"
                  aria-label="நீக்கு"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default Bookmarks;
