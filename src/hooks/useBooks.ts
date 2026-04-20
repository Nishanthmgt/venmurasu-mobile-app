import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Book = {
  id: string;
  slug: string;
  order_num: number;
  title_ta: string;
  title_en: string | null;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
};

export type Chapter = {
  id: string;
  book_id: string;
  slug: string;
  order_num: number;
  title_ta: string;
  description: string | null;
  published_at: string | null;
};

export type Part = {
  id: string;
  chapter_id: string;
  slug: string;
  order_num: number;
  title_ta: string;
  content: string | null;
  image_urls: string[];
  youtube_urls: string[];
};

export const useBooks = () =>
  useQuery({
    queryKey: ["books"],
    queryFn: async (): Promise<Book[]> => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("order_num", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useBookBySlug = (slug: string | undefined) =>
  useQuery({
    queryKey: ["book", slug],
    queryFn: async (): Promise<Book | null> => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

export const useChapters = (bookId: string | undefined) =>
  useQuery({
    queryKey: ["chapters", bookId],
    queryFn: async (): Promise<Chapter[]> => {
      if (!bookId) return [];
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("book_id", bookId)
        .order("order_num", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!bookId,
  });

export const useChapterBySlug = (bookId: string | undefined, slug: string | undefined) =>
  useQuery({
    queryKey: ["chapter", bookId, slug],
    queryFn: async (): Promise<Chapter | null> => {
      if (!bookId || !slug) return null;
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("book_id", bookId)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!bookId && !!slug,
  });

export const useParts = (chapterId: string | undefined) =>
  useQuery({
    queryKey: ["parts", chapterId],
    queryFn: async (): Promise<Part[]> => {
      if (!chapterId) return [];
      const { data, error } = await supabase
        .from("parts")
        .select("*")
        .eq("chapter_id", chapterId)
        .order("order_num", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!chapterId,
  });
