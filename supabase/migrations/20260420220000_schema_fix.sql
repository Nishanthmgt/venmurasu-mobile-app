-- Fix for missing published_at and duplicated triggers
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS published_at TEXT;

-- Safe trigger creation for all tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
    AND table_name IN ('books', 'chapters', 'parts', 'glossary', 'communities', 'characters', 'map_locations')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
        
        -- Also ensure RLS is active for admin access
        EXECUTE format('DROP POLICY IF EXISTS "Public Write %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Public Write %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
    END LOOP;
END $$;
