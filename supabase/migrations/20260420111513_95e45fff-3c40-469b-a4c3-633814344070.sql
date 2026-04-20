-- Storage bucket for book images
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-assets', 'book-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read book-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-assets');

CREATE POLICY "Public upload book-assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'book-assets');

CREATE POLICY "Public update book-assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'book-assets');

CREATE POLICY "Public delete book-assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'book-assets');

-- Write policies for content tables (admin gated client-side via password)
CREATE POLICY "Public insert books" ON public.books FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update books" ON public.books FOR UPDATE USING (true);
CREATE POLICY "Public delete books" ON public.books FOR DELETE USING (true);

CREATE POLICY "Public insert chapters" ON public.chapters FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update chapters" ON public.chapters FOR UPDATE USING (true);
CREATE POLICY "Public delete chapters" ON public.chapters FOR DELETE USING (true);

CREATE POLICY "Public insert parts" ON public.parts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update parts" ON public.parts FOR UPDATE USING (true);
CREATE POLICY "Public delete parts" ON public.parts FOR DELETE USING (true);

-- Updated_at triggers
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON public.parts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();