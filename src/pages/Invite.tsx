import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Invite() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Setting things up…");

  useEffect(() => {
    const c = (code || "").toLowerCase().trim();
    if (!c) {
      navigate("/", { replace: true });
      return;
    }
    try {
      localStorage.setItem("pendingInviteCode", c);
    } catch {}

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setMsg("Adding your friend…");
        const { data: res } = await supabase.rpc("claim_invite", { p_code: c });
        try { localStorage.removeItem("pendingInviteCode"); } catch {}
        const inviterId = (res as any)?.inviter_id;
        if (inviterId) navigate(`/u/${inviterId}`, { replace: true });
        else navigate("/friends", { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    })();
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#05070d] gap-4">
      <img src={logo} alt="Hagion" className="w-16 h-16 rounded-2xl" />
      <Loader2 className="w-5 h-5 animate-spin opacity-70" />
      <p className="text-sm text-white/70">{msg}</p>
    </div>
  );
}
