import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useBookBySlug, useChapters } from "@/hooks/useBooks";
import { Loader2, ChevronRight } from "lucide-react";

const BookPage = () => {
  const { bookSlug = "" } = useParams();
  const { data: book, isLoading: bookLoading } = useBookBySlug(bookSlug);
  const { data: chapters, isLoading: chLoading } = useChapters(book?.id);

  if (bookLoading) {
    return (
      <div className="min-h-screen">
        <PageHeader title="..." back="/books" />
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen">
        <PageHeader title="நூல் கிடைக்கவில்லை" back="/books" />
        <p className="text-center mt-12 text-muted-foreground font-serif">இந்த நூல் இல்லை.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <PageHeader title={book.title_ta} back="/books" />
      <main className="container max-w-3xl px-4 mt-6">
        <div className="text-center mb-8">
          <p className="text-muted-foreground font-serif">{book.subtitle}</p>
          {book.description && (
            <p className="mt-3 text-sm text-foreground/80 font-serif max-w-xl mx-auto">{book.description}</p>
          )}
        </div>

        <h2 className="font-serif text-lg text-primary mb-3 px-1">அத்தியாயங்கள்</h2>

        {chLoading ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : chapters && chapters.length > 0 ? (
          <ol className="paper-card rounded-lg overflow-hidden divide-y divide-border">
            {chapters.map((ch, i) => (
              <li key={ch.id}>
                <Link
                  to={`/book/${book.slug}/chapter/${ch.slug}/part/start`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/50 transition-colors group"
                >
                  <span className="text-accent font-serif tabular-nums w-8 text-right">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-foreground">{ch.title_ta}</div>
                    {ch.published_at && (
                      <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                        {new Date(ch.published_at).toLocaleDateString("ta-IN", { year: "numeric", month: "long", day: "numeric" })}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-center py-12 text-muted-foreground font-serif">அத்தியாயங்கள் இல்லை.</p>
        )}
      </main>
    </div>
  );
};

export default BookPage;
