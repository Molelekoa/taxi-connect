import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Cached hook that resolves auth.uid → profile.id.
 * Result is cached for 10 minutes to avoid repeated RPC calls
 * across dashboards, notifications, and other components.
 */
export const useProfileId = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: profileId = null, isLoading } = useQuery({
    queryKey: ["profileId", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.rpc("get_profile_id", {
        _auth_uid: user.id,
      });
      if (error) throw error;
      return data as string | null;
    },
    enabled: !!user && !authLoading,
    staleTime: 10 * 60 * 1000, // 10 minutes — profile ID never changes within a session
    gcTime: 30 * 60 * 1000,
  });

  return { profileId, isLoading: authLoading || isLoading };
};
