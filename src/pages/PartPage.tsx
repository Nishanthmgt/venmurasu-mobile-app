import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Menu, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSettings } from "@/hooks/useSettings";
import { useBookBySlug, useChapterBySlug, useParts } from "@/hooks/useBooks";
import { saveLastRead } from "@/data/venmurasu";

const PartPage = () => {
  const { bookSlug = "", chapterSlug = "", partSlug = "" } = useParams();
  const { data: book } = useBookBySlug(bookSlug);
  const { data: chapter } = useChapterBySlug(book?.id, chapterSlug);
  const { data: parts, isLoading } = useParts(chapter?.id);
  const [open, setOpen] = useState(false);
  const { fontClass } = useSettings();

  const part = partSlug === "start" 
    ? parts?.[0] 
    : parts?.find((p) => p.slug === partSlug) || parts?.[0];

  useEffect(() => {
    if (book && chapter && part) {
      saveLastRead({
        bookSlug: book.slug,
        bookTitle: book.title_ta,
        bookImage: book.cover_image_url ?? undefined,
        chapterSlug: chapter.slug,
        chapterTitle: chapter.title_ta,
        partSlug: part.slug,
        partTitle: part.title_ta,
        at: Date.now(),
      });
    }
  }, [book, chapter, part]);

  if (isLoading || !book || !chapter) {
    return (
      <div className="min-h-screen">
        <PageHeader title="..." back={`/book/${bookSlug}`} />
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen">
        <PageHeader title="பகுதி கிடைக்கவில்லை" back={`/book/${book.slug}`} />
      </div>
    );
  }

  const idx = parts!.findIndex((p) => p.slug === part.slug);
  const prev = parts![idx - 1];
  const next = parts![idx + 1];

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title={part.title_ta}
        back={`/book/${book.slug}`}
        right={
          <div className="flex items-center">
            <BookmarkButton
              data={{
                id: `part:${book.slug}:${chapter.slug}:${part.slug}`,
                kind: "part",
                title: part.title_ta,
                subtitle: `${book.title_ta} · ${chapter.title_ta}`,
                href: `/book/${book.slug}/chapter/${chapter.slug}/part/${part.slug}`,
              }}
            />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 rounded-md hover:bg-secondary text-muted-foreground"
                  aria-label="பகுதிப் பட்டியல்"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-card">
                <SheetHeader>
                  <SheetTitle className="font-serif text-primary">{chapter.title_ta}</SheetTitle>
                </SheetHeader>
                <ol className="mt-4 space-y-1 max-h-[80vh] overflow-y-auto pr-2">
                  {parts!.map((p, i) => (
                    <li key={p.id}>
                      <Link
                        to={`/book/${book.slug}/chapter/${chapter.slug}/part/${p.slug}`}
                        onClick={() => setOpen(false)}
                        className={`flex gap-3 px-3 py-2 rounded-md font-serif text-sm transition-colors ${
                          p.slug === part.slug
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-secondary text-foreground"
                        }`}
                      >
                        <span className="tabular-nums opacity-70 w-6 text-right">{i + 1}.</span>
                        <span>{p.title_ta}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </SheetContent>
            </Sheet>
          </div>
        }
      />

      <main className={`container max-w-2xl px-4 mt-6 animate-fade-up ${fontClass}`}>
        <p className="text-center text-muted-foreground font-serif text-sm mb-4">
          {book.title_ta} · {chapter.title_ta}
        </p>
        <article className="paper-card rounded-lg p-6 md:p-8">
          <h2 className="font-serif text-2xl text-primary mb-2 text-center">{part.title_ta}</h2>
          <div className="ornament-divider mb-5"><span className="text-xs">❖</span></div>

          {part.content ? (
            <div className="font-serif text-foreground/90 leading-loose whitespace-pre-wrap">
              {part.content}
            </div>
          ) : (
            <p className="text-center text-muted-foreground font-serif italic py-8">
              உள்ளடக்கம் விரைவில் சேர்க்கப்படும்.
            </p>
          )}

          {part.image_urls.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {part.image_urls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${part.title_ta} - ${i + 1}`}
                  loading="lazy"
                  className="rounded-md shadow-paper w-full object-cover"
                />
              ))}
            </div>
          )}

          {part.youtube_urls.length > 0 && (
            <div className="mt-6 space-y-4">
              {part.youtube_urls.map((url, i) => {
                const id = extractYouTubeId(url);
                if (!id) return null;
                return (
                  <div key={i} className="relative aspect-video rounded-md overflow-hidden shadow-paper bg-secondary">
                    <iframe
                      src={`https://www.youtube.com/embed/${id}`}
                      title={`${part.title_ta} - video ${i + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <nav className="flex items-center justify-between mt-6 gap-3">
          {prev ? (
            <Link
              to={`/book/${book.slug}/chapter/${chapter.slug}/part/${prev.slug}`}
              className="paper-card rounded-md px-4 py-2 font-serif text-sm text-primary hover:bg-secondary/60 flex items-center gap-2 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="truncate max-w-[10rem]">{prev.title_ta}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link
              to={`/book/${book.slug}/chapter/${chapter.slug}/part/${next.slug}`}
              className="paper-card rounded-md px-4 py-2 font-serif text-sm text-primary hover:bg-secondary/60 flex items-center gap-2 ml-auto transition"
            >
              <span className="truncate max-w-[10rem]">{next.title_ta}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : <span />}
        </nav>
      </main>
    </div>
  );
};

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export default PartPage;
