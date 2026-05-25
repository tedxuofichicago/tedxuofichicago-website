import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, ExternalLink, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout";
import { SectionHeader } from "@/components/sections";
import { SpeakerCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "../lib/supabaseClient";
import type { Event, Speaker, EventSpeaker, Photo } from "@/types";

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [eventSpeakersList, setEventSpeakersList] = useState<
    { speaker: Speaker; eventSpeaker: EventSpeaker }[]
  >([]);
  const [eventPhotos, setEventPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function loadEventData() {
      // 1. Load the event by slug
      const { data: eventsData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .limit(1);

      if (eventError || !eventsData || eventsData.length === 0) {
        console.error("Error loading event", eventError);
        setLoading(false);
        return;
      }

      const row = eventsData[0];

      const mappedEvent: Event = {
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
        albumUrl: row.album_url ?? "",
      };

      setEvent(mappedEvent);

      // 2. Load speakers for this event using event_speakers + speakers
      const { data: eventSpeakersData, error: esError } = await supabase
        .from("event_speakers")
        .select(
          `
          id,
          talk_title,
          talk_description,
          youtube_url,
          order,
          speaker: speakers (*)
        `,
        )
        .eq("event_id", row.id)
        .order("order", { ascending: true });

      if (esError) {
        console.error("Error loading event speakers", esError);
      } else {
        const mappedES: { speaker: Speaker; eventSpeaker: EventSpeaker }[] = (
          eventSpeakersData ?? []
        ).map((es: any) => ({
          speaker: {
            id: es.speaker.id,
            slug: es.speaker.slug,
            name: es.speaker.name,
            title: es.speaker.title,
            affiliation: es.speaker.affiliation,
            tags: es.speaker.tags ?? [],
            headshot: es.speaker.headshot_url ?? "",
            shortBio: es.speaker.bio_short ?? "",
            fullBio: es.speaker.bio_long ?? "",
          },
          eventSpeaker: {
            id: es.id,
            eventId: row.id,
            speakerId: es.speaker.id,
            talkTitle: es.talk_title,
            talkDescription: es.talk_description,
            youtubeUrl: es.youtube_url ?? undefined,
            order: es.order,
          },
        }));

        setEventSpeakersList(mappedES);
      }

      // 3. Load photos for this event
      const { data: photosData, error: photosError } = await supabase
        .from("photos")
        .select("*")
        .eq("event_id", row.id)
        .order("order", { ascending: true });

      if (photosError) {
        console.error("Error loading photos", photosError);
      } else {
        const mappedPhotos: Photo[] =
          photosData?.map((p: any) => ({
            id: p.id,
            eventId: p.event_id,
            url: p.image_url,
            caption: p.caption ?? "",
            category: p.category,
            order: p.order,
          })) ?? [];

        setEventPhotos(mappedPhotos);
      }

      setLoading(false);
    }

    loadEventData();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-20 text-center">Loading event…</div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
          <Button asChild>
            <Link to="/events">Back to Events</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: event.heroImage
              ? `url("${encodeURI(event.heroImage)}")`
              : undefined,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <div className="container relative z-10 pb-12">
          <Link
            to="/events"
            className="inline-flex items-center text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{event.year}</Badge>
            {event.isFlagship && (
              <Badge className="bg-primary text-primary-foreground">
                Flagship
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-2">{event.theme}</h1>
          <p className="text-xl text-muted-foreground mb-6">{event.name}</p>
          <div className="flex flex-col sm:flex-row gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl">
            <SectionHeader title="About This Event" />
            <p className="text-lg text-muted-foreground">{event.description}</p>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <SectionHeader title="Location" />
              <p className="text-lg font-semibold mb-2">{event.location}</p>
              <p className="text-muted-foreground mb-4">
                {event.locationAddress}
              </p>
              <Button variant="outline" asChild>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    event.locationAddress,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
            {import.meta.env.VITE_GOOGLE_MAPS_KEY ? (
              <div className="aspect-video rounded-lg overflow-hidden border">
                <iframe
                  title="Event Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.google.com/maps/embed/v1/place?key=${
                    import.meta.env.VITE_GOOGLE_MAPS_KEY
                  }&q=${encodeURIComponent(event.locationAddress)}`}
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Speakers */}
      {eventSpeakersList.length > 0 && (
        <section className="py-16">
          <div className="container">
            <SectionHeader
              title="Speakers"
              subtitle={`Meet the minds behind ${event.theme}`}
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {eventSpeakersList.map(({ speaker, eventSpeaker }) => (
                <SpeakerCard
                  key={speaker.id}
                  speaker={speaker}
                  eventSpeaker={eventSpeaker}
                  event={event}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photos */}
      {eventPhotos.length > 0 && (
        <section className="py-16 bg-secondary/30">
          <div className="container">
            <div className="flex items-end justify-between mb-8">
              <SectionHeader title="Event Photos" />
              {event.albumUrl && (
                <Button variant="outline" asChild>
                  <a
                    href={event.albumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Full Album
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {eventPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-video rounded-lg overflow-hidden border"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
