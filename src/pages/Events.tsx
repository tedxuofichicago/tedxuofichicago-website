import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { SectionHeader } from "@/components/sections";
import { EventCard } from "@/components/cards";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import type { Event } from "@/types";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEventId, setFeaturedEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      const [{ data: settingsData }, { data: eventsData, error: eventsError }] =
        await Promise.all([
          supabase
            .from("site_settings")
            .select("featured_event_id")
            .maybeSingle(),
          supabase
            .from("events")
            .select("*")
            .order("date", { ascending: false }),
        ]);

      if (eventsError) {
        console.error("Error loading events", eventsError);
        setLoading(false);
        return;
      }

      const mapped: Event[] = (eventsData ?? []).map((row: any) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        theme: row.theme,
        year: row.year,
        date: row.date,
        time: row.start_time ?? "",
        location: row.location_name ?? "",
        locationAddress: row.location_address ?? "",
        heroImage: row.hero_image_url ?? "",
        description: row.description ?? "",
        isFlagship: row.is_flagship ?? false,
        albumUrl: row.album_url ?? undefined,
      }));

      setEvents(mapped);
      setFeaturedEventId(settingsData?.featured_event_id ?? null);
      setLoading(false);
    }

    loadEvents();
  }, []);

  if (loading) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container">Loading events…</div>
        </section>
      </Layout>
    );
  }

  if (!events.length) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container">No events found.</div>
        </section>
      </Layout>
    );
  }

  const featuredEvent =
    events.find((e) => e.id === featuredEventId) || events[0];

  const pastEvents = events.filter((e) => e.id !== featuredEvent.id);

  const eventsByYear = pastEvents.reduce(
    (acc, event) => {
      const year = event.year;
      if (!acc[year]) acc[year] = [];
      acc[year].push(event);
      return acc;
    },
    {} as Record<number, Event[]>,
  );

  const sortedYears = Object.keys(eventsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <SectionHeader
            title="Events"
            subtitle="Explore our past and upcoming TEDx conferences"
            centered
          />
        </div>
      </section>

      {/* Featured Event */}
      <section className="py-20">
        <div className="container">
          <div className="mb-6">
            <Badge className="bg-primary text-primary-foreground mb-4">
              {featuredEvent.isFlagship ? "Upcoming Event" : "Most Recent"}
            </Badge>
            <h2 className="text-3xl font-bold">{featuredEvent.theme}</h2>
          </div>
          <div className="max-w-2xl">
            <EventCard event={featuredEvent} />
          </div>
        </div>
      </section>

      {/* Past Events by Year */}
      {sortedYears.length > 0 && (
        <section className="py-20 bg-secondary/30">
          <div className="container">
            <SectionHeader title="Past Events" />
            {sortedYears.map((year) => (
              <div key={year} className="mb-12 last:mb-0">
                <h3 className="text-2xl font-bold mb-6">{year}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventsByYear[year].map((event) => (
                    <EventCard key={event.id} event={event} />
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
