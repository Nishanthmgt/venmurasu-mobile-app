import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useBooks } from "@/hooks/useBooks";
import { Loader2 } from "lucide-react";

const AllBooks = () => {
  const { data: books, isLoading } = useBooks();

  return (
    <div className="min-h-screen pb-16">
      <PageHeader title="அனைத்து நூல்கள்" back="/" />
      <main className="container max-w-3xl px-4 mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {books?.map((b) => (
              <Link
                key={b.id}
                to={`/book/${b.slug}`}
                className="group block animate-fade-up"
                aria-label={b.title_ta}
              >
                <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-gradient-gold shadow-paper group-hover:shadow-deep transition-all duration-300 group-hover:-translate-y-1">
                  {b.cover_image_url && (
                    <img
                      src={b.cover_image_url}
                      alt={b.title_ta}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-accent/80 to-accent/40" />
                </div>
                <div className="mt-2 text-center">
                  <div className="font-serif text-sm text-foreground leading-tight line-clamp-2">{b.title_ta}</div>
                  {b.subtitle && (
                    <div className="text-xs text-muted-foreground font-serif mt-0.5 line-clamp-1">{b.subtitle}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllBooks;
