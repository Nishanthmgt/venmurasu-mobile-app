import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookMarked, Bookmark, Settings as SettingsIcon, Info, Sun, Moon, Book } from "lucide-react";
import { getLastRead, type LastRead } from "@/data/venmurasu";
import { useSettings } from "@/hooks/useSettings";
import cardBooks from "@/assets/card-books.jpg";
import cardRelationships from "@/assets/card-relationships.jpg";
import cardMap from "@/assets/card-map.jpg";
import cardGlossary from "@/assets/card-glossary.jpg";

const SECONDARY = [
  { to: "/bookmarks", label: "அடையாளங்கள்", Icon: Bookmark },
  { to: "/settings", label: "அமைப்புகள்", Icon: SettingsIcon },
  { to: "/about", label: "ஆசிரியர்", Icon: Info },
];

const QUICK = [
  { to: "/books", label: "வெண்முரசு", image: cardBooks },
  { to: "/relationships", label: "உறவுகள்", image: cardRelationships },
  { to: "/map", label: "வரைபடம்", image: cardMap },
  { to: "/glossary", label: "கலைச்சொற்கள்", image: cardGlossary },
];

const Index = () => {
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const { theme, setTheme } = useSettings();

  useEffect(() => {
    setLastRead(getLastRead());
  }, []);

  const lastReadHref = lastRead
    ? lastRead.partSlug
      ? `/book/${lastRead.bookSlug}/chapter/${lastRead.chapterSlug}/part/${lastRead.partSlug}`
      : `/book/${lastRead.bookSlug}`
    : "#";

  return (
    <div className="min-h-screen pb-20">
      {/* Top bar with logo + theme toggle */}
      <div className="container max-w-3xl px-4 pt-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="வெண்முரசு">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Book className="h-6 w-6" />
          </div>
          <span className="font-serif text-lg text-primary leading-none">வெண்முரசு</span>
        </Link>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "ஒளி" : "இருள்"}
          className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      <header className="pt-6 pb-6 text-center">
        <div className="ornament-divider mx-auto max-w-xs px-4 mb-3"><span className="text-accent">❖</span></div>
        <h1 className="font-serif text-4xl md:text-5xl text-primary tracking-tight">வெண்முரசு</h1>
        <p className="mt-2 text-sm text-muted-foreground font-serif">இலக்கிய வாசிப்பு செயலி</p>
        <div className="ornament-divider mx-auto max-w-xs px-4 mt-3"><span className="text-accent">❖</span></div>
      </header>

      <main className="container max-w-3xl px-4">
        {lastRead && (
          <section className="mb-8">
            <h2 className="font-serif text-xl text-primary mb-3">தொடர்ந்து வாசிக்க</h2>
            <Link
              to={lastReadHref}
              className="paper-card rounded-lg p-3 flex items-center gap-4 hover:shadow-deep hover:-translate-y-0.5 transition-all"
            >
              {lastRead.bookImage ? (
                <img
                  src={lastRead.bookImage}
                  alt={lastRead.bookTitle}
                  loading="lazy"
                  className="h-16 w-12 object-cover rounded shadow-paper shrink-0"
                />
              ) : (
                <div className="h-16 w-12 rounded bg-gradient-gold flex items-center justify-center text-accent-foreground shadow-paper shrink-0">
                  <BookMarked className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-serif text-base text-primary truncate">{lastRead.bookTitle}</div>
                <div className="text-sm text-muted-foreground font-serif truncate">
                  {lastRead.chapterTitle}
                  {lastRead.partTitle ? ` · ${lastRead.partTitle}` : ""}
                </div>
                <div className="text-[11px] text-muted-foreground font-serif mt-0.5">
                  {new Date(lastRead.at).toLocaleDateString("ta-IN")}
                </div>
              </div>
            </Link>
          </section>
        )}

        <section className="grid grid-cols-2 gap-4">
          {QUICK.map(({ to, label, image }) => (
            <Link
              key={to}
              to={to}
              className="paper-card rounded-xl overflow-hidden flex flex-col hover:shadow-deep hover:-translate-y-0.5 transition-all group"
            >
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                <img
                  src={image}
                  alt={label}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="px-3 py-3 text-center">
                <span className="font-serif text-base text-primary">{label}</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-6 grid grid-cols-3 gap-3">
          {SECONDARY.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className="paper-card rounded-lg px-3 py-3 flex flex-col items-center gap-1 hover:bg-secondary/50 transition-colors"
            >
              <Icon className="h-5 w-5 text-accent" />
              <span className="font-serif text-xs text-primary text-center">{label}</span>
            </Link>
          ))}
        </section>

        <section className="mt-10 py-4 px-4 paper-card rounded-lg border border-accent/20 text-center">
          <p className="text-sm text-muted-foreground font-serif">
            App will be launching soon on <span className="font-semibold text-primary">Google Play Store</span>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Index;
