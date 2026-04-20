import { useGlossary } from "@/hooks/useSupabaseData";
import { PageHeader } from "@/components/PageHeader";
import { useEffect, useState } from "react";
import { Search, Bookmark as BIcon, Loader2 } from "lucide-react";
import { isBookmarked, toggleBookmark } from "@/data/venmurasu";
import { toast } from "@/hooks/use-toast";

const WordRow = ({ word, meaning }: { word: string; meaning: string }) => {
  const id = `word:${word}`;
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(isBookmarked(id)); }, [id]);
  return (
    <li className="px-5 py-4 flex items-start gap-3 animate-fade-in">
      <div className="flex-1">
        <div className="font-serif text-lg text-primary">{word}</div>
        <div className="text-sm text-muted-foreground font-serif mt-0.5">{meaning}</div>
      </div>
      <button
        onClick={() => {
          const added = toggleBookmark({ id, kind: "word", title: word, subtitle: meaning, href: "/glossary", at: Date.now() });
          setOn(added);
          toast({ title: added ? "சேமிக்கப்பட்டது" : "நீக்கப்பட்டது", description: word });
        }}
        className="p-2 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
        aria-label="அடையாளம் இடு"
      >
        <BIcon className={`h-4 w-4 ${on ? "fill-accent text-accent" : ""}`} />
      </button>
    </li>
  );
};

const ToughWords = () => {
  const [q, setQ] = useState("");
  const { data: glossaryTerms, isLoading, error } = useGlossary();

  const list = (glossaryTerms || []).filter(
    (w) => w.word.includes(q.trim()) || w.meaning.includes(q.trim())
  );

  return (
    <div className="min-h-screen pb-16">
      <PageHeader title="கலைச்சொற்கள்" back="/" />
      <main className="container max-w-2xl px-4 mt-6">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="சொல்லைத் தேடுங்கள்..."
            className="w-full h-12 pl-11 pr-4 rounded-full bg-card border border-border shadow-paper font-serif placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="font-serif">ஏற்றப்படுகிறது...</p>
          </div>
        ) : error ? (
          <div className="paper-card rounded-lg p-10 text-center text-destructive font-serif">
            தரவுகளைப் பெறுவதில் சிக்கல் ஏற்பட்டுள்ளது.
          </div>
        ) : (
          <ul className="paper-card rounded-lg divide-y divide-border overflow-hidden">
            {list.map((w) => (
              <WordRow key={w.id} word={w.word} meaning={w.meaning} />
            ))}
            {list.length === 0 && (
              <li className="px-5 py-16 text-center text-muted-foreground font-serif">
                {q.trim() ? "சொல் கிடைக்கவில்லை" : "பட்டியல் காலியாக உள்ளது"}
              </li>
            )}
          </ul>
        )}
      </main>
    </div>
  );
};

export default ToughWords;
