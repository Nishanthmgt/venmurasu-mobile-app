-- Add image_url to map_locations
ALTER TABLE public.map_locations ADD COLUMN IF NOT EXISTS image_url TEXT;
