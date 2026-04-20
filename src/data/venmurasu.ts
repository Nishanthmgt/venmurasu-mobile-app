// வெண்முரசு - bookmarks, communities, glossary, helpers

// ── Last-read tracking (localStorage, slug-based) ─────────────────────
export type LastRead = {
  bookSlug: string;
  bookTitle: string;
  bookImage?: string;
  chapterSlug: string;
  chapterTitle: string;
  partSlug?: string;
  partTitle?: string;
  at: number;
};

const LR_KEY = "venmurasu:last-read:v2";

export function saveLastRead(lr: LastRead) {
  try { localStorage.setItem(LR_KEY, JSON.stringify(lr)); } catch {}
}

export function getLastRead(): LastRead | null {
  try {
    const raw = localStorage.getItem(LR_KEY);
    return raw ? (JSON.parse(raw) as LastRead) : null;
  } catch { return null; }
}

// ── Bookmarks (localStorage) ──────────────────────────────────────────
export type BookmarkKind = "book" | "topic" | "part" | "word";
export type Bookmark = {
  id: string;
  kind: BookmarkKind;
  title: string;
  subtitle?: string;
  href: string;
  at: number;
};

const BM_KEY = "venmurasu:bookmarks";

export function getBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(BM_KEY);
    return raw ? (JSON.parse(raw) as Bookmark[]) : [];
  } catch { return []; }
}

export function isBookmarked(id: string): boolean {
  return getBookmarks().some((b) => b.id === id);
}

export function toggleBookmark(b: Bookmark): boolean {
  const list = getBookmarks();
  const exists = list.some((x) => x.id === b.id);
  const next = exists ? list.filter((x) => x.id !== b.id) : [{ ...b, at: Date.now() }, ...list];
  try { localStorage.setItem(BM_KEY, JSON.stringify(next)); } catch {}
  return !exists;
}

// ── Communities (placeholder) ─────────────────────────────────────────
export const COMMUNITIES = [
  { id: "c1", name: "சந்திரவம்சம்", description: "சந்திர குலத்தினர்" },
  { id: "c2", name: "சூரியவம்சம்", description: "சூரிய குலத்தினர்" },
  { id: "c3", name: "யாதவர்", description: "யாதவ குலம்" },
  { id: "c4", name: "நாகர்", description: "நாக குலம்" },
];

// ── Glossary (placeholder) ────────────────────────────────────────────
export const TOUGH_WORDS = [
  { word: "பந்தனவன்", meaning: "கட்டுண்டவன்" },
  { word: "வழித்துணை", meaning: "பயணத்தில் உடனிருப்பவர்" },
  { word: "நிலவறை", meaning: "நிலத்தடி அறை" },
  { word: "ஆலமரம்", meaning: "பெரும் விருட்சம்" },
  { word: "கடுந்தவம்", meaning: "கடினமான தவம்" },
  { word: "ஒளிமுகம்", meaning: "பிரகாசமான முகம்" },
  { word: "தேன்மொழி", meaning: "இனிய சொல்" },
];

// ── Helpers ───────────────────────────────────────────────────────────
export function toTamilNumber(n: number): string {
  const map = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];
  return String(n).split("").map((d) => map[+d] ?? d).join("");
}
