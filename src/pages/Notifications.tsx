import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, UserPlus, Radio, CheckCheck, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface NotificationRow {
  id: string;
  user_id: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_avatar: string | null;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const formatRelative = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [prefs, setPrefs] = useState({
    chatResponses: true,
    newFeatures: true,
    systemUpdates: false,
    dailyReminders: false,
    follows: true,
    liveStreams: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem("notification_preferences");
    if (stored) {
      try {
        setPrefs((p) => ({ ...p, ...JSON.parse(stored) }));
      } catch {}
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;
      setUserId(user?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (cancelled) return;
      setItems((data as NotificationRow[]) || []);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setItems((prev) => [payload.new as NotificationRow, ...prev].slice(0, 50));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleTogglePref = (key: keyof typeof prefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("notification_preferences", JSON.stringify(next));
      return next;
    });
  };

  const markAllRead = async () => {
    if (!userId) return;
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
  };

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const deleteOne = async (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notifications").delete().eq("id", id);
  };

  const handleClick = (n: NotificationRow) => {
    if (!n.is_read) markRead(n.id);
    if (n.link) navigate(n.link);
  };

  const iconFor = (type: string) => {
    if (type === "follow") return UserPlus;
    if (type === "live") return Radio;
    return Bell;
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  const notificationSettings = [
    { key: "follows" as const, title: "New followers", description: "When someone follows you" },
    { key: "liveStreams" as const, title: "Live streams", description: "When people you follow go live" },
    { key: "chatResponses" as const, title: t("chat_responses"), description: t("chat_responses_desc") },
    { key: "newFeatures" as const, title: t("new_features"), description: t("new_features_desc") },
    { key: "systemUpdates" as const, title: t("system_updates"), description: t("system_updates_desc") },
    { key: "dailyReminders" as const, title: t("daily_reminders"), description: t("daily_reminders_desc") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between gap-4 px-4 py-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold">{t("notifications")}</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="gap-1.5">
            <CheckCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Mark all read</span>
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-auto px-4 py-6 pb-32">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Inbox */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inbox</CardTitle>
              <CardDescription>Follows, live streams, and activity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
              ) : !userId ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Sign in to see your notifications.
                </div>
              ) : items.length === 0 ? (
                <div className="p-10 flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No notifications yet.</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {items.map((n) => {
                    const Icon = iconFor(n.type);
                    return (
                      <li
                        key={n.id}
                        className={cn(
                          "group flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition",
                          !n.is_read && "bg-primary/5",
                        )}
                        onClick={() => handleClick(n)}
                      >
                        <div
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center shrink-0 ring-1",
                            n.type === "live"
                              ? "bg-rose-500/15 ring-rose-500/30 text-rose-500"
                              : "bg-primary/10 ring-primary/20 text-primary",
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn("text-sm leading-snug truncate", !n.is_read && "font-semibold")}>
                              {n.title}
                            </p>
                            {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                          </div>
                          {n.body && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{n.body}</p>
                          )}
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {formatRelative(n.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteOne(n.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>{t("notification_preferences")}</CardTitle>
              <CardDescription>{t("notification_preferences_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {notificationSettings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between space-x-4">
                  <div className="flex-1">
                    <Label htmlFor={setting.key} className="text-base cursor-pointer">
                      {setting.title}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                  </div>
                  <Switch
                    id={setting.key}
                    checked={prefs[setting.key]}
                    onCheckedChange={() => handleTogglePref(setting.key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <PremiumNav />
    </div>
  );
};

export default Notifications;
