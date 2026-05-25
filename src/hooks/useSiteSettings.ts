import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { SiteSettings } from "@/types";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Error loading site settings", error);
        setLoading(false);
        return;
      }

      if (data) {
        setSettings({
          featuredEventId: data.featured_event_id ?? "",
          instagramUrl: data.instagram_url ?? "",
          youtubeUrl: data.youtube_url ?? "",
          emailAddress: data.email_address ?? "",
          twitterUrl: data.twitter_url ?? undefined,
          linkedInUrl: data.linkedin_url ?? undefined,
        });
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading };
}
