import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { PremiumNav } from "@/components/PremiumNav";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GroupDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [group, setGroup] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    load();
  }, [id]);

  const load = async () => {
    if (!id) return;
    const { data: g } = await supabase.from("groups").select("*").eq("id", id).maybeSingle();
    setGroup(g);
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { data: m } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", id)
        .eq("user_id", u.user.id)
        .maybeSingle();
      setJoined(!!m);
    }
  };

  const toggleJoin = async () => {
    if (!user || !id) {
      toast({ title: "Please sign in" });
      return;
    }
    if (joined) {
      await supabase.from("group_members").delete().eq("group_id", id).eq("user_id", user.id);
    } else {
      await supabase.from("group_members").insert({ group_id: id, user_id: user.id });
    }
    load();
  };

  return (
    <div className="min-h-screen text-white">
      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        <CommunityHeader title="Group" />
        {group && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] p-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/30 via-white/10 to-white/5 ring-1 ring-white/30 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-playfair text-2xl">{group.name}</h2>
            <div className="text-[12px] text-white/55 mt-1">{group.member_count} members</div>
            {group.description && (
              <p className="mt-4 text-white/80 leading-relaxed">{group.description}</p>
            )}
            <Button
              onClick={toggleJoin}
              className="mt-5 rounded-full bg-gradient-to-r from-white/95 to-white/80 text-black"
            >
              {joined ? "Leave Group" : "Join Group"}
            </Button>
          </div>
        )}
      </main>
      <PremiumNav />
    </div>
  );
}
