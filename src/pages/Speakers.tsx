import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { SectionHeader } from "@/components/sections";
import { SpeakerCard } from "@/components/cards";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import type {
  Event,
  Speaker,
  EventSpeaker,
  SpeakerWithTalk,
  EventWithSpeakers,
} from "@/types";

export default function SpeakersPage() {
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [featuredSpeakers, setFeaturedSpeakers] = useState<SpeakerWithTalk[]>(
    [],
  );
  const [pastEvents, setPastEvents] = useState<EventWithSpeakers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSpeakersPage() {
      // 1) load site settings (for featuredEventId)
      const { data: settingsData, error: settingsError } = await supabase
        .from("site_settings")
        .select("*")
        .maybeSingle();

      if (settingsError) {
        console.error("Error loading site settings", settingsError);
        setLoading(false);
        return;
      }

      const featuredEventId: string | null =
        settingsData?.featured_event_id ?? null;

      // 2) load all events (most recent first)
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });

      if (eventsError || !eventsData) {
        console.error("Error loading events", eventsError);
        setLoading(false);
        return;
      }

      const mappedEvents: Event[] = eventsData.map((e: any) => ({
        id: e.id,
        slug: e.slug,
        name: e.name,
        theme: e.theme,
        year: e.year,
        date: e.date,
        time: e.start_time ?? "",
        location: e.location_name ?? "",
        locationAddress: e.location_address ?? "",
        heroImage: e.hero_image_url ?? "",
        description: e.description ?? "",
        isFlagship: e.is_flagship ?? false,
        albumUrl: e.album_url ?? undefined,
      }));

      const featured =
        mappedEvents.find((e) => e.id === featuredEventId) ?? mappedEvents[0];

      if (!featured) {
        setLoading(false);
        return;
      }

      // 3) load event_speakers + speakers for ALL events in one query
      const { data: esData, error: esError } = await supabase
        .from("event_speakers")
        .select(
          `
          id,
          event_id,
          speaker_id,
          talk_title,
          talk_description,
          youtube_url,
          order,
          speakers (*),
          events (*)
        `,
        )
        .order("order", { ascending: true });

      if (esError || !esData) {
        console.error("Error loading event speakers", esError);
        setLoading(false);
        return;
      }

      // 4) map rows into SpeakerWithTalk; skip rows whose event isn't loaded
      const allSpeakerWithTalk: SpeakerWithTalk[] = esData.flatMap(
        (row: any) => {
          const eventRow = mappedEvents.find((e) => e.id === row.event_id);
          if (!eventRow || !row.speakers) return [];

          const speaker: Speaker = {
            id: row.speakers.id,
            slug: row.speakers.slug,
            name: row.speakers.name,
            title: row.speakers.title,
            affiliation: row.speakers.affiliation,
            tags: row.speakers.tags ?? [],
            headshot: row.speakers.headshot_url ?? "",
            shortBio: row.speakers.bio_short ?? "",
            fullBio: row.speakers.bio_long ?? "",
          };

          const eventSpeaker: EventSpeaker = {
            id: row.id,
            eventId: row.event_id,
            speakerId: row.speaker_id,
            talkTitle: row.talk_title,
            talkDescription: row.talk_description,
            youtubeUrl: row.youtube_url ?? undefined,
            order: row.order,
          };

          return [{ ...speaker, eventSpeaker, event: eventRow }];
        },
      );

      // 5) split into featured vs past
      const featuredSpeakersList = allSpeakerWithTalk.filter(
        (s) => s.event.id === featured.id,
      );

      const pastEventsMap = new Map<string, EventWithSpeakers>();

      allSpeakerWithTalk.forEach((s) => {
        if (s.event.id === featured.id) return; // skip featured here

        if (!pastEventsMap.has(s.event.id)) {
          pastEventsMap.set(s.event.id, {
            ...s.event,
            speakers: [],
          });
        }

        const entry = pastEventsMap.get(s.event.id)!;
        entry.speakers.push({
          ...s.eventSpeaker,
          speaker: {
            id: s.id,
            slug: s.slug,
            name: s.name,
            title: s.title,
            affiliation: s.affiliation,
            tags: s.tags,
            headshot: s.headshot,
            shortBio: s.shortBio,
            fullBio: s.fullBio,
          },
        });
      });

      setFeaturedEvent(featured);
      setFeaturedSpeakers(featuredSpeakersList);
      setPastEvents(Array.from(pastEventsMap.values()));
      setLoading(false);
    }

    loadSpeakersPage();
  }, []);

  if (loading) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container text-center">Loading speakers…</div>
        </section>
      </Layout>
    );
  }

  if (!featuredEvent) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container text-center">
            No events with speakers yet.
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <SectionHeader
            title="Speakers"
            subtitle="Meet the inspiring minds who have graced our stage"
            centered
          />
        </div>
      </section>

      {/* Featured Event Speakers */}
      {featuredSpeakers.length > 0 && (
        <section className="py-20">
          <div className="container">
            <div className="mb-8">
              <Badge className="bg-primary text-primary-foreground mb-4">
                {featuredEvent.isFlagship ? "Upcoming Event" : "Most Recent"}
              </Badge>
              <h2 className="text-3xl font-bold">
                {featuredEvent.theme} — {featuredEvent.year}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredSpeakers.map((s) => (
                <SpeakerCard
                  key={s.id}
                  speaker={s}
                  eventSpeaker={s.eventSpeaker}
                  event={s.event}
                  linkState={{ from: "speakers" }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Past Event Speakers */}
      {pastEvents.length > 0 && (
        <section className="py-20 bg-secondary/30">
          <div className="container">
            <SectionHeader title="Past Speakers" />
            {pastEvents.map((evt) => (
              <div key={evt.id} className="mb-16 last:mb-0">
                <h3 className="text-2xl font-bold mb-2">{evt.theme}</h3>
                <p className="text-muted-foreground mb-6">{evt.name}</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {evt.speakers.map((es) => (
                    <SpeakerCard
                      key={es.speaker.id}
                      speaker={es.speaker}
                      eventSpeaker={es}
                      event={evt}
                      linkState={{ from: "speakers" }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
