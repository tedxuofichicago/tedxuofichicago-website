import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { Layout } from "@/components/layout";
import { SectionHeader } from "@/components/sections";
import { EventCard, SpeakerCard, NewsPostCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import type { Event, Speaker, EventSpeaker, NewsPost } from "@/types";

export default function HomePage() {
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [featuredSpeakers, setFeaturedSpeakers] = useState<
    { speaker: Speaker; eventSpeaker: EventSpeaker }[]
  >([]);
  const [recentNews, setRecentNews] = useState<NewsPost[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHome() {
      // 1) site_settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("site_settings")
        .select("*")
        .maybeSingle();

      if (settingsError) {
        console.error("Error loading site settings", settingsError);
      }

      const featuredEventId: string | null =
        settingsData?.featured_event_id ?? null;

      // 2) all events (latest first)
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

      // 3) featured event speakers (join)
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
          speakers (*)
        `,
        )
        .eq("event_id", featured.id)
        .order("order", { ascending: true })
        .limit(4);

      if (esError) {
        console.error("Error loading featured speakers", esError);
      }

      const mappedFeaturedSpeakers: {
        speaker: Speaker;
        eventSpeaker: EventSpeaker;
      }[] = (esData ?? []).flatMap((row: any) => {
        if (!row.speakers) return [];

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

        return [{ speaker, eventSpeaker }];
      });

      // 4) recent news
      const { data: newsData, error: newsError } = await supabase
        .from("news_posts")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(2);

      if (newsError) {
        console.error("Error loading news posts", newsError);
      }

      const mappedNews: NewsPost[] =
        newsData?.map((n: any) => ({
          id: n.id,
          slug: n.slug,
          title: n.title,
          excerpt: n.excerpt,
          content: n.content,
          coverImage: n.cover_image_url ?? "",
          publishedAt: n.published_at,
          author: n.author,
        })) ?? [];

      // 5) past events (first two not equal to featured)
      const past = mappedEvents.filter((e) => e.id !== featured.id).slice(0, 2);

      setFeaturedEvent(featured);
      setFeaturedSpeakers(mappedFeaturedSpeakers);
      setRecentNews(mappedNews);
      setPastEvents(past);
      setLoading(false);
    }

    loadHome();
  }, []);

  if (loading || !featuredEvent) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container text-center">Loading…</div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: featuredEvent.heroImage
              ? `url("${encodeURI(featuredEvent.heroImage)}")`
              : undefined,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        </div>
        <div className="container relative z-10 py-20">
          <div className="max-w-2xl">
            <p className="text-primary font-semibold uppercase tracking-wider mb-4">
              {featuredEvent.isFlagship ? "Upcoming Event" : "Latest Event"}
            </p>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="text-primary">Ideas</span>{" "}
              <span className="text-foreground">Worth Spreading</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {featuredEvent.theme} — {featuredEvent.name}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>
                  {new Date(featuredEvent.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{featuredEvent.location}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to={`/events/${featuredEvent.slug}`}>
                  Explore Event <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">Learn About TEDx</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader
                title="What is TEDx?"
                subtitle="Independently organized TED events"
              />
              <p className="text-muted-foreground mb-6">
                In the spirit of ideas worth spreading, TED has created TEDx, a
                program of local, self-organized events that bring people
                together to share a TED-like experience.
              </p>
              <p className="text-muted-foreground mb-6">
                At TEDxUofIChicago, we bring together the brightest minds from
                our university and community to share ideas that matter.
              </p>
              <Button variant="outline" asChild>
                <Link to="/about">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden border shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
                  alt="TEDx Event"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                <div className="text-center">
                  <div className="text-3xl font-bold">x</div>
                  <div className="text-xs uppercase tracking-wider">
                    Independently organized
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Speakers */}
      {featuredSpeakers.length > 0 && (
        <section className="py-20">
          <div className="container">
            <div className="flex items-end justify-between mb-8">
              <SectionHeader
                title="Featured Speakers"
                subtitle={`${featuredEvent.theme} — ${featuredEvent.year}`}
              />
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link to="/speakers">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredSpeakers.map(({ speaker, eventSpeaker }) => (
                <SpeakerCard
                  key={speaker.id}
                  speaker={speaker}
                  eventSpeaker={eventSpeaker}
                  event={featuredEvent}
                />
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Button variant="outline" asChild>
                <Link to="/speakers">View All Speakers</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className="py-20 bg-secondary/30">
          <div className="container">
            <div className="flex items-end justify-between mb-8">
              <SectionHeader
                title="Past Events"
                subtitle="Explore our previous conferences"
              />
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link to="/events">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest News */}
      {recentNews.length > 0 && (
        <section className="py-20">
          <div className="container">
            <div className="flex items-end justify-between mb-8">
              <SectionHeader
                title="Latest News"
                subtitle="Updates from our team"
              />
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link to="/news">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {recentNews.map((post) => (
                <NewsPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to be Inspired?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join us at our next event and experience the power of ideas worth
            spreading.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to={`/events/${featuredEvent.slug}`}>Get Tickets</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link to="/team">Join Our Team</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
