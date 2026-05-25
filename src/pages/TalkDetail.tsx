import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import type { Event, Speaker, EventSpeaker } from "@/types";

export default function TalkDetailPage() {
  const { eventSlug, speakerSlug } = useParams<{
    eventSlug: string;
    speakerSlug: string;
  }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [speaker, setSpeaker] = useState<Speaker | null>(null);
  const [eventSpeaker, setEventSpeaker] = useState<EventSpeaker | null>(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation() as { state?: { from?: string } };
  const fromSpeakers = location.state?.from === "speakers";

  useEffect(() => {
    if (!eventSlug || !speakerSlug) return;

    async function loadTalk() {
      // 1) event by slug
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("slug", eventSlug)
        .single();

      if (eventError || !eventData) {
        console.error("Error loading event", eventError);
        setLoading(false);
        return;
      }

      const mappedEvent: Event = {
        id: eventData.id,
        slug: eventData.slug,
        name: eventData.name,
        theme: eventData.theme,
        year: eventData.year,
        date: eventData.date,
        time: eventData.start_time ?? "",
        location: eventData.location_name ?? "",
        locationAddress: eventData.location_address ?? "",
        heroImage: eventData.hero_image_url ?? "",
        description: eventData.description ?? "",
        isFlagship: eventData.is_flagship ?? false,
        albumUrl: eventData.album_url ?? undefined,
      };

      // 2) speaker by slug
      const { data: speakerData, error: speakerError } = await supabase
        .from("speakers")
        .select("*")
        .eq("slug", speakerSlug)
        .single();

      if (speakerError || !speakerData) {
        console.error("Error loading speaker", speakerError);
        setLoading(false);
        return;
      }

      const mappedSpeaker: Speaker = {
        id: speakerData.id,
        slug: speakerData.slug,
        name: speakerData.name,
        title: speakerData.title,
        affiliation: speakerData.affiliation,
        tags: speakerData.tags ?? [],
        headshot: speakerData.headshot_url ?? "",
        shortBio: speakerData.bio_short ?? "",
        fullBio: speakerData.bio_long ?? "",
      };

      // 3) event_speakers join row for this event + speaker
      const { data: esData, error: esError } = await supabase
        .from("event_speakers")
        .select("*")
        .eq("event_id", eventData.id)
        .eq("speaker_id", speakerData.id)
        .single();

      if (esError || !esData) {
        console.error("Error loading event_speaker", esError);
        setLoading(false);
        return;
      }

      const mappedEventSpeaker: EventSpeaker = {
        id: esData.id,
        eventId: esData.event_id,
        speakerId: esData.speaker_id,
        talkTitle: esData.talk_title,
        talkDescription: esData.talk_description,
        youtubeUrl: esData.youtube_url ?? undefined,
        order: esData.order,
      };

      setEvent(mappedEvent);
      setSpeaker(mappedSpeaker);
      setEventSpeaker(mappedEventSpeaker);
      setLoading(false);
    }

    loadTalk();
  }, [eventSlug, speakerSlug]);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-20 text-center">Loading talk…</div>
      </Layout>
    );
  }

  if (!event || !speaker || !eventSpeaker) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Talk Not Found</h1>
          <Button asChild>
            <Link to={fromSpeakers ? "/speakers" : "/events"}>
              Back to {fromSpeakers ? "Speakers" : "Events"}
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const backToHref = fromSpeakers ? "/speakers" : `/events/${event.slug}`;
  const backToLabel = fromSpeakers ? "Speakers" : event.theme || "Event";

  const embedUrl = eventSpeaker.youtubeUrl
    ? getYouTubeEmbedUrl(eventSpeaker.youtubeUrl)
    : null;

  return (
    <Layout>
      {/* Navigation */}
      <section className="py-8 border-b">
        <div className="container">
          <Link
            to={backToHref}
            className="inline-flex items-center text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {backToLabel}
          </Link>
        </div>
      </section>

      {/* Video / Talk Header */}
      <section className="py-12">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Video or Placeholder */}
            <div className="lg:col-span-2">
              {embedUrl ? (
                <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                  <iframe
                    title={eventSpeaker.talkTitle}
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                  <div className="text-center p-8">
                    <p className="text-muted-foreground mb-4">
                      Video coming soon
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This talk will be available after the event.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{event.year}</Badge>
                  <Badge variant="outline">{event.theme}</Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {eventSpeaker.talkTitle}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {eventSpeaker.talkDescription}
                </p>

                {eventSpeaker.youtubeUrl && (
                  <Button variant="outline" className="mt-6" asChild>
                    <a
                      href={eventSpeaker.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Watch on YouTube <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Speaker Info */}
            <div>
              <div className="sticky top-24">
                <div className="rounded-lg overflow-hidden border mb-6">
                  <img
                    src={speaker.headshot}
                    alt={speaker.name}
                    className="w-full aspect-square object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold">{speaker.name}</h2>
                <p className="text-primary font-medium">{speaker.title}</p>
                <p className="text-muted-foreground mb-4">
                  {speaker.affiliation}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {speaker.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="prose prose-sm text-muted-foreground">
                  <p>{speaker.fullBio}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
