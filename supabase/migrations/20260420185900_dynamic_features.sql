
-- Glossary / Tough Words
CREATE TABLE public.glossary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Communities
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Characters (for Relationship Trees)
CREATE TABLE public.characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_num INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Map Locations
CREATE TABLE public.map_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_locations ENABLE ROW LEVEL SECURITY;

-- Select Policies (Public)
CREATE POLICY "Anyone can view glossary" ON public.glossary FOR SELECT USING (true);
CREATE POLICY "Anyone can view communities" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Anyone can view characters" ON public.characters FOR SELECT USING (true);
CREATE POLICY "Anyone can view map_locations" ON public.map_locations FOR SELECT USING (true);

-- Admin Policies (Public WRITE for now, as existing app does it this way, but gated by admin key in app)
-- To be fully secure, these should use auth.uid() but the current setup uses public access with client-side gating.
-- I'll stick to the current pattern for consistency, but add a note about security.
CREATE POLICY "Public insert glossary" ON public.glossary FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update glossary" ON public.glossary FOR UPDATE USING (true);
CREATE POLICY "Public delete glossary" ON public.glossary FOR DELETE USING (true);

CREATE POLICY "Public insert communities" ON public.communities FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update communities" ON public.communities FOR UPDATE USING (true);
CREATE POLICY "Public delete communities" ON public.communities FOR DELETE USING (true);

CREATE POLICY "Public insert characters" ON public.characters FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update characters" ON public.characters FOR UPDATE USING (true);
CREATE POLICY "Public delete characters" ON public.characters FOR DELETE USING (true);

CREATE POLICY "Public insert map_locations" ON public.map_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update map_locations" ON public.map_locations FOR UPDATE USING (true);
CREATE POLICY "Public delete map_locations" ON public.map_locations FOR DELETE USING (true);

-- Triggers for updated_at
CREATE TRIGGER glossary_updated_at BEFORE UPDATE ON public.glossary
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER communities_updated_at BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER characters_updated_at BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER map_locations_updated_at BEFORE UPDATE ON public.map_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seeding some initial data from the placeholders
INSERT INTO public.glossary (word, meaning) VALUES 
('பந்தனவன்', 'கட்டுண்டவன்'),
('வழித்துணை', 'பயணத்தில் உடனிருப்பவர்'),
('நிலவறை', 'நிலத்தடி அறை'),
('ஆலமரம்', 'பெரும் விருட்சம்'),
('கடுந்தவம்', 'கடினமான தவம்'),
('ஒளிமுகம்', 'பிரகாசமான முகம்'),
('தேன்மொழி', 'இனிய சொல்');

INSERT INTO public.communities (name, description) VALUES 
('சந்திரவம்சம்', 'சந்திர குலத்தினர்'),
('சூரியவம்சம்', 'சூரிய குலத்தினர்'),
('யாதவர்', 'யாதவ குலம்'),
('நாகர்', 'நாக குலம்');
