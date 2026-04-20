import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type GlossaryTerm = {
  id: string;
  word: string;
  meaning: string;
};

export type Community = {
  id: string;
  name: string;
  description: string | null;
};

export type Character = {
  id: string;
  community_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  order_num: number;
};

export type MapLocation = {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
};

export const useGlossary = () =>
  useQuery({
    queryKey: ["glossary"],
    queryFn: async (): Promise<GlossaryTerm[]> => {
      const { data, error } = await supabase
        .from("glossary")
        .select("*")
        .order("word", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useCommunities = () =>
  useQuery({
    queryKey: ["communities"],
    queryFn: async (): Promise<Community[]> => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useCharacters = (communityId: string | undefined) =>
  useQuery({
    queryKey: ["characters", communityId],
    queryFn: async (): Promise<Character[]> => {
      if (!communityId) return [];
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("community_id", communityId)
        .order("order_num", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!communityId,
  });

export const useMapLocations = () =>
  useQuery({
    queryKey: ["map-locations"],
    queryFn: async (): Promise<MapLocation[]> => {
      const { data, error } = await supabase
        .from("map_locations")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useCommunityById = (id: string | undefined) =>
  useQuery({
    queryKey: ["community", id],
    queryFn: async (): Promise<Community | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
