import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Demo account for Google Play review - gets unlimited messages
const DEMO_EMAIL = "demo.hagionai@gmail.com";
const STAFF_EMAILS = ["fabyygarciia@gmail.com", "nicholasexousia@gmail.com"];

export const useMessageLimit = () => {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoAccount, setIsDemoAccount] = useState(false);

  const fetchUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRemaining(null);
        setIsDemoAccount(false);
        setLoading(false);
        return;
      }

      // Demo + staff accounts get unlimited messages
      const lower = user.email?.toLowerCase() ?? "";
      if (lower === DEMO_EMAIL.toLowerCase() || STAFF_EMAILS.includes(lower)) {
        setRemaining(null);
        setIsDemoAccount(lower === DEMO_EMAIL.toLowerCase());
        setLoading(false);
        return;
      }

      setIsDemoAccount(false);

      const { data, error } = await supabase
        .from('user_message_usage')
        .select('message_count, last_reset_at')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // No record yet, user has full limit
        setRemaining(5);
        setLoading(false);
        return;
      }

      if (data) {
        const lastReset = new Date(data.last_reset_at);
        const now = new Date();
        const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

        if (hoursSinceReset >= 24) {
          // Reset period passed
          setRemaining(5);
        } else {
          setRemaining(Math.max(0, 5 - data.message_count));
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching usage:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  return { remaining, loading, refetch: fetchUsage, isDemoAccount };
};
