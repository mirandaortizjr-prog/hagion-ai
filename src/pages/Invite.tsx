import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, AlertCircle } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Invite() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Setting things up…");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const consumed = useRef(false);

  useEffect(() => {
    const c = (code || "").toLowerCase().trim();
    if (!c) {
      navigate("/", { replace: true });
      return;
    }

    // Persist so signup/signin flows can claim it
    try {
      localStorage.setItem("pendingInviteCode", c);
    } catch {}

    const claim = async () => {
      if (consumed.current) return;
      consumed.current = true;
      setMsg("Connecting you with your friend…");
      try {
        const { data, error } = await supabase.rpc("claim_invite", { p_code: c });
        try { localStorage.removeItem("pendingInviteCode"); } catch {}
        const res: any = data;
        if (error || !res?.ok) {
          setStatus("error");
          setMsg(res?.error === "self_invite"
            ? "That's your own invite link."
            : "This invite link is invalid or expired.");
          setTimeout(() => navigate("/", { replace: true }), 1800);
          return;
        }
        setStatus("ok");
        setMsg("You're connected! Opening their profile…");
        const inviterId = res?.inviter_id;
        setTimeout(() => {
          if (inviterId) navigate(`/u/${inviterId}`, { replace: true });
          else navigate("/friends", { replace: true });
        }, 700);
      } catch (e) {
        setStatus("error");
        setMsg("Something went wrong. Please try again.");
        setTimeout(() => navigate("/", { replace: true }), 1800);
      }
    };

    // If already signed in, claim immediately
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        claim();
      } else {
        setMsg("Sign in to accept your invite…");
        // Send to auth; keep the invite code so Auth.tsx can claim after signin
        navigate("/auth?redirect=" + encodeURIComponent(`/invite/${c}`), { replace: true });
      }
    });

    // Also listen for auth changes in case session hydrates late
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session && !consumed.current) claim();
    });
    return () => sub.subscription.unsubscribe();
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#05070d] gap-4 px-6 text-center">
      <img src={logo} alt="Hagion" className="w-16 h-16 rounded-2xl" />
      {status === "loading" && <Loader2 className="w-5 h-5 animate-spin opacity-70" />}
      {status === "ok" && <Check className="w-6 h-6 text-emerald-400" />}
      {status === "error" && <AlertCircle className="w-6 h-6 text-amber-400" />}
      <p className="text-sm text-white/70 max-w-xs">{msg}</p>
    </div>
  );
}
