import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Bell,
  HelpCircle,
  LogOut,
  Star,
  BookOpen,
  Camera,
  Loader2,
  Check,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LanguageToggle from "@/components/LanguageToggle";
import { BottomNav } from "@/components/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Settings = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{
    avatar_url: string | null;
    banner_url: string | null;
    name: string | null;
  }>({ avatar_url: null, banner_url: null, name: "" });
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url, banner_url, name")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data) {
          setProfile(data);
          setName(data.name || "");
        }
      }
    })();
  }, []);

  const uploadImage = async (file: File, kind: "avatar" | "banner") => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to update your profile.", variant: "destructive" });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 8MB.", variant: "destructive" });
      return;
    }

    const setLoading = kind === "avatar" ? setUploadingAvatar : setUploadingBanner;
    setLoading(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `profiles/${user.id}/${kind}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("community-media")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage
        .from("community-media")
        .getPublicUrl(path);

      const field = kind === "avatar" ? "avatar_url" : "banner_url";
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ [field]: publicUrl })
        .eq("user_id", user.id);
      if (updErr) throw updErr;

      setProfile((p) => ({ ...p, [field]: publicUrl }));
      toast({ title: "Updated", description: kind === "avatar" ? "Profile photo updated." : "Banner updated." });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, "avatar");
    e.target.value = "";
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, "banner");
    e.target.value = "";
  };

  const handleSaveName = async () => {
    if (!user) return;
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim() || null })
      .eq("user_id", user.id);
    setSavingName(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Display name updated." });
      setProfile((p) => ({ ...p, name: name.trim() }));
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: t('error'), description: t('failed_logout'), variant: "destructive" });
    } else {
      toast({ title: t('logged_out'), description: t('logged_out_success') });
      navigate("/auth");
    }
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem("onboardingCompleted");
    toast({
      title: language === 'es' ? 'Tutorial reiniciado' : 'Tutorial Reset',
      description: language === 'es' ? 'Volverás a ver el tutorial en tu próxima visita' : 'You will see the tutorial on your next visit',
    });
    navigate("/onboarding");
  };

  const sections = [
    {
      title: t('account'),
      items: [
        { icon: User, label: t('profile'), action: () => navigate("/profile") },
        { icon: Bell, label: t('notifications'), action: () => navigate("/notifications") },
        { icon: Star, label: t('pro'), action: () => navigate("/premium"), isPro: true },
      ],
    },
    {
      title: t('support'),
      items: [
        { icon: HelpCircle, label: t('help_support'), action: () => navigate("/support") },
        { icon: BookOpen, label: language === 'es' ? 'Ver Tutorial de Nuevo' : 'View Tutorial Again', action: handleResetOnboarding },
      ],
    },
  ];

  const initial = (profile.name?.[0] || user?.email?.[0] || "U").toUpperCase();
  const nameChanged = (name || "") !== (profile.name || "");

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <header
        className="sticky top-0 z-30 backdrop-blur-2xl bg-black/30 border-b border-white/10"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-playfair tracking-wide">{t('settings')}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pb-32 pt-4">
        {/* PROFILE EDITOR CARD */}
        <section className="rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent backdrop-blur-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]">
          {/* Banner */}
          <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-gradient-to-br from-primary/20 via-accent/15 to-white/5">
            {profile.banner_url && (
              <img
                src={profile.banner_url}
                alt="Banner"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            <button
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-xs font-medium transition disabled:opacity-60"
            >
              {uploadingBanner ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              {profile.banner_url ? "Change cover" : "Add cover"}
            </button>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
            />
          </div>

          {/* Avatar + name */}
          <div className="relative px-5 sm:px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-black/40 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.8)]">
                  {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt="Profile" />}
                  <AvatarFallback className="bg-gradient-to-br from-primary/40 via-accent/30 to-white/10 text-2xl font-playfair text-white">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg ring-2 ring-black/40 hover:scale-105 active:scale-95 transition disabled:opacity-60"
                  aria-label="Change profile photo"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="text-base font-semibold truncate">
                  {profile.name || (user?.email?.split("@")[0] ?? "Your name")}
                </div>
                <div className="text-xs text-white/50 truncate">{user?.email || "Not signed in"}</div>
              </div>
            </div>

            {/* Name edit */}
            <div className="mt-5 space-y-2">
              <label className="text-[11px] uppercase tracking-[0.18em] text-white/50">Display name</label>
              <div className="flex items-center gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={50}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary/40 rounded-xl"
                />
                <Button
                  onClick={handleSaveName}
                  disabled={!nameChanged || savingName || !user}
                  className={cn(
                    "rounded-xl px-4 transition-all",
                    nameChanged
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/10 text-white/50 hover:bg-white/10"
                  )}
                >
                  {savingName ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : nameChanged ? (
                    "Save"
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTIONS */}
        <div className="mt-8 space-y-7">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-2 px-2">
                {section.title}
              </h2>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden divide-y divide-white/[0.06]">
                {section.items.map((item: any, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.04] transition text-left group"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center ring-1 transition",
                        item.isPro
                          ? "bg-gradient-to-br from-amber-400/30 to-orange-500/20 ring-amber-300/30"
                          : "bg-white/5 ring-white/10 group-hover:bg-white/10"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4", item.isPro ? "text-amber-200" : "text-white/80")} />
                    </div>
                    <span className="flex-1 text-sm font-medium text-white/90">{item.label}</span>
                    {item.isPro && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 text-black">
                        Pro
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Preferences */}
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-2 px-2">
              {t('preferences')}
            </h2>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-4 py-3.5 flex items-center justify-between">
              <span className="text-sm font-medium text-white/90">{t('language')}</span>
              <LanguageToggle />
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/15 backdrop-blur-xl px-4 py-3.5 transition text-red-300 font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            {t('log_out')}
          </button>

          <div className="text-center text-xs text-white/40 pt-4">
            <p className="font-playfair tracking-wider">Hagion AI · v1.0.0</p>
            <p className="mt-1">© 2025 All rights reserved</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;
