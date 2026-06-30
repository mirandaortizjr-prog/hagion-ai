import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PremiumNav } from "@/components/PremiumNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSafeBackNavigation } from "@/hooks/useSafeBackNavigation";
import {
  ArrowLeft,
  Church as ChurchIcon,
  Copy,
  CheckCircle2,
  Loader2,
  LogOut,
  Share2,
  MapPin,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MyChurchPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const handleBack = useSafeBackNavigation("/community/groups");

  const [user, setUser] = useState<any>(null);
  const [church, setChurch] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(params.get("register") === "1");

  // register form
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("USA");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // composer
  const [composer, setComposer] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (!data.user) { setLoading(false); return; }
      const { data: cm } = await supabase
        .from("church_members" as any)
        .select("church_id, role, churches(*)")
        .eq("user_id", data.user.id)
        .maybeSingle();
      const ch = (cm as any)?.churches;
      setChurch(ch || null);
      if (ch) {
        const { data: p } = await (supabase.from("posts") as any)
          .select("*")
          .eq("church_id", ch.id)
          .order("created_at", { ascending: false })
          .limit(50);
        setPosts(p || []);
      }
      setLoading(false);
    })();
  }, []);

  const registerChurch = async () => {
    if (!user) return navigate("/auth");
    if (!name.trim()) { toast({ title: "Church name required", variant: "destructive" }); return; }
    setSubmitting(true);
    const { data, error } = await (supabase.from("churches") as any).insert({
      name: name.trim(),
      city: city.trim() || null,
      state: state.trim() || null,
      country: country.trim() || null,
      description: desc.trim() || null,
      pastor_id: user.id,
    }).select().single();
    if (error || !data) {
      setSubmitting(false);
      toast({ title: "Could not register", description: error?.message, variant: "destructive" });
      return;
    }
    // auto-join as pastor
    await supabase.from("church_members" as any).insert({
      church_id: data.id, user_id: user.id, role: "pastor",
    });
    setSubmitting(false);
    toast({ title: "Church registered 🏛️" });
    setRegistering(false);
    window.location.reload();
  };

  const leaveChurch = async () => {
    if (!user || !church) return;
    if (!window.confirm(`Leave ${church.name}?`)) return;
    await supabase.from("church_members" as any).delete().eq("user_id", user.id).eq("church_id", church.id);
    window.location.reload();
  };

  const copyCode = async () => {
    if (!church?.invite_code) return;
    await navigator.clipboard.writeText(church.invite_code);
    toast({ title: "Invite code copied" });
  };

  const shareLink = async () => {
    if (!church?.invite_code) return;
    const url = `${window.location.origin}/join-church/${church.invite_code}`;
    try {
      if (navigator.share) await navigator.share({ title: church.name, url });
      else { await navigator.clipboard.writeText(url); toast({ title: "Link copied" }); }
    } catch {}
  };

  const post = async () => {
    if (!user || !church || !composer.trim()) return;
    setPosting(true);
    const { error } = await (supabase.from("posts") as any).insert({
      user_id: user.id,
      author_name: user.user_metadata?.name || user.email?.split("@")[0] || "Believer",
      content: composer.trim(),
      post_type: "post",
      church_id: church.id,
      visibility: "church",
    });
    setPosting(false);
    if (error) { toast({ title: "Could not post", description: error.message, variant: "destructive" }); return; }
    setComposer("");
    const { data: p } = await (supabase.from("posts") as any)
      .select("*").eq("church_id", church.id).order("created_at", { ascending: false }).limit(50);
    setPosts(p || []);
  };

  return (
    <div className="min-h-screen text-white">
      <main className="px-4 sm:px-6 pb-32 max-w-2xl mx-auto">
        <header className="pt-5 pb-3 flex items-center gap-2 animate-fade-in">
          <button onClick={handleBack} className="h-9 w-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="flex-1 font-playfair text-xl tracking-tight truncate">My Church</h1>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/40"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : !user ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
            <p className="text-white/70 mb-3">Sign in to join your church.</p>
            <Button onClick={() => navigate("/auth")} className="rounded-full">Sign in</Button>
          </div>
        ) : registering || (!church && params.get("register") === "1") ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 space-y-3 animate-fade-in">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-300/30 to-amber-700/10 ring-1 ring-amber-300/30 flex items-center justify-center">
                <ChurchIcon className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <h3 className="font-playfair text-[16px]">Register your church</h3>
                <p className="text-[11.5px] text-white/55">For pastors and church leaders.</p>
              </div>
            </div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Church name" maxLength={120} className="h-10 rounded-xl bg-white/5 border-white/15" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="h-10 rounded-xl bg-white/5 border-white/15" />
              <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="h-10 rounded-xl bg-white/5 border-white/15" />
            </div>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className="h-10 rounded-xl bg-white/5 border-white/15" />
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Brief description (optional)" rows={2} className="rounded-xl bg-white/5 border-white/15 resize-none" />
            <Button onClick={registerChurch} disabled={submitting || !name.trim()} className="w-full h-10 rounded-full bg-primary text-primary-foreground">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Register Church"}
            </Button>
            <p className="text-[10.5px] text-white/45 text-center">Verification by Hagion staff happens after registration.</p>
          </section>
        ) : !church ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center space-y-3">
            <p className="text-white/70">You haven't joined a church yet.</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate("/community/groups")} variant="outline" className="rounded-full border-white/20 bg-white/5">Find via invite</Button>
              <Button onClick={() => setRegistering(true)} className="rounded-full">Register church</Button>
            </div>
          </div>
        ) : (
          <>
            {/* Church header card */}
            <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-300/10 via-white/[0.04] to-transparent backdrop-blur-xl p-4 mb-4 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300/30 to-amber-700/10 ring-1 ring-amber-300/30 flex items-center justify-center shrink-0">
                  <ChurchIcon className="w-6 h-6 text-amber-100" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-playfair text-[18px] leading-tight truncate">{church.name}</h2>
                    {church.verified && <CheckCircle2 className="w-4 h-4 text-sky-300 shrink-0" />}
                  </div>
                  {(church.city || church.state) && (
                    <div className="text-[11.5px] text-white/55 mt-0.5 inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {[church.city, church.state, church.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                  <div className="text-[11.5px] text-white/55 mt-0.5 inline-flex items-center gap-1">
                    <Users className="w-3 h-3" /> {church.member_count || 0} members
                  </div>
                </div>
              </div>

              {/* Invite */}
              <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-2.5 flex items-center gap-2">
                <code className="flex-1 font-mono text-[12px] tracking-wider text-white/80 px-2">{church.invite_code}</code>
                <button onClick={copyCode} className="h-7 w-7 rounded-md hover:bg-white/10 flex items-center justify-center" aria-label="Copy">
                  <Copy className="w-3.5 h-3.5 text-white/70" />
                </button>
                <button onClick={shareLink} className="h-7 w-7 rounded-md hover:bg-white/10 flex items-center justify-center" aria-label="Share">
                  <Share2 className="w-3.5 h-3.5 text-white/70" />
                </button>
              </div>

              <button onClick={leaveChurch} className="mt-2 text-[11px] text-white/40 hover:text-white/70 inline-flex items-center gap-1">
                <LogOut className="w-3 h-3" /> Leave church
              </button>
            </section>

            {/* Composer (church-only) */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 mb-4">
              <Textarea
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder={`Share with ${church.name}…`}
                rows={2}
                className="resize-none bg-transparent border-0 focus-visible:ring-0 text-[14px] text-white placeholder:text-white/40"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10.5px] text-white/40">Only members see church posts.</p>
                <Button size="sm" onClick={post} disabled={posting || !composer.trim()} className="h-8 rounded-full">
                  {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Post"}
                </Button>
              </div>
            </section>

            {/* Church feed */}
            <section className="space-y-2">
              {posts.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-white/50 text-[13px]">
                  No posts yet. Be the first to share.
                </div>
              ) : posts.map((p) => (
                <article key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                  <div className="text-[12px] text-white/65 mb-1.5 flex items-center gap-2">
                    <span className="font-medium text-white/90">{p.author_name || "Believer"}</span>
                    <span className="text-white/35">· {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-[14px] leading-relaxed text-white/90 whitespace-pre-wrap">{p.content}</p>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
      <PremiumNav />
    </div>
  );
}
