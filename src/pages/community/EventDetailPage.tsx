import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { PremiumNav } from "@/components/PremiumNav";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EventDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [ev, setEv] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    load();
  }, [id]);

  const load = async () => {
    if (!id) return;
    const { data: e } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
    setEv(e);
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { data: a } = await supabase
        .from("event_attendees")
        .select("id")
        .eq("event_id", id)
        .eq("user_id", u.user.id)
        .maybeSingle();
      setJoined(!!a);
    }
  };

  const toggle = async () => {
    if (!user || !id) {
      toast({ title: "Please sign in" });
      return;
    }
    if (joined) {
      await supabase.from("event_attendees").delete().eq("event_id", id).eq("user_id", user.id);
    } else {
      await supabase.from("event_attendees").insert({ event_id: id, user_id: user.id });
    }
    load();
  };

  return (
    <div className="min-h-screen text-white">
      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        <CommunityHeader title="Event" />
        {ev && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden">
            {ev.image_url && <img src={ev.image_url} alt={ev.title} className="w-full aspect-video object-cover" />}
            <div className="p-6">
              <h2 className="font-playfair text-2xl">{ev.title}</h2>
              <div className="mt-3 space-y-2 text-[13px] text-white/70">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(ev.event_date).toLocaleString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
                {ev.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {ev.location}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {ev.attendee_count} attending
                </div>
              </div>
              {ev.description && <p className="mt-4 text-white/80 leading-relaxed">{ev.description}</p>}
              <Button
                onClick={toggle}
                className="mt-5 rounded-full bg-gradient-to-r from-white/95 to-white/80 text-black"
              >
                {joined ? "Cancel RSVP" : "Join Event"}
              </Button>
            </div>
          </div>
        )}
      </main>
      <PremiumNav />
    </div>
  );
}
