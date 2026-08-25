import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileId } from "@/hooks/useProfileId";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  content: string;
  read: boolean;
  created_at: string;
  related_match_id: string | null;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const { profileId } = useProfileId();
  const queryClient = useQueryClient();

  const { data: notifications = [], isError } = useQuery({
    queryKey: ["notifications", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20) as { data: Notification[] | null };
      return data ?? [];
    },
    enabled: !!profileId,
    staleTime: 30 * 1000, // 30s — realtime subscription handles instant updates
  });

  // Real-time subscription — invalidate cache on new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true } as any).eq("id", id);
    queryClient.setQueryData(["notifications", profileId], (old: Notification[] | undefined) =>
      (old ?? []).map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true } as any).in("id", unreadIds);
    queryClient.setQueryData(["notifications", profileId], (old: Notification[] | undefined) =>
      (old ?? []).map(n => ({ ...n, read: true }))
    );
  };

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full text-foreground hover:bg-secondary transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] h-[18px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-sm text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {isError ? (
            <p className="p-4 text-sm text-destructive text-center">Couldn't load notifications</p>
          ) : notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">No notifications yet</p>
          ) : (
            notifications.map(n => (
              <button
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`w-full text-left px-4 py-3 border-b border-border last:border-0 transition-colors ${
                  n.read ? "bg-background" : "bg-primary/5"
                } hover:bg-secondary`}
              >
                <p className="text-sm text-foreground">{n.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
