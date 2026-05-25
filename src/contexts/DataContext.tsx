import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import type {
  Event,
  Speaker,
  EventSpeaker,
  TeamMember,
  Photo,
  NewsPost,
  SiteSettings,
} from "@/types";
import { supabase } from "@/lib/supabaseClient";

// --- DB row → TypeScript type mappers ---

function toEvent(r: any): Event {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    theme: r.theme,
    year: r.year,
    date: r.date,
    time: r.start_time ?? "",
    location: r.location_name ?? "",
    locationAddress: r.location_address ?? "",
    heroImage: r.hero_image_url ?? "",
    description: r.description ?? "",
    isFlagship: r.is_flagship ?? false,
    albumUrl: r.album_url ?? undefined,
  };
}

function fromEvent(e: Omit<Event, "id">) {
  return {
    slug: e.slug,
    name: e.name,
    theme: e.theme,
    year: e.year,
    date: e.date,
    start_time: e.time,
    location_name: e.location,
    location_address: e.locationAddress,
    hero_image_url: e.heroImage,
    description: e.description,
    is_flagship: e.isFlagship,
    album_url: e.albumUrl ?? null,
  };
}

function toSpeaker(r: any): Speaker {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    title: r.title,
    affiliation: r.affiliation,
    tags: r.tags ?? [],
    headshot: r.headshot_url ?? "",
    shortBio: r.bio_short ?? "",
    fullBio: r.bio_long ?? "",
  };
}

function fromSpeaker(s: Omit<Speaker, "id">) {
  return {
    slug: s.slug,
    name: s.name,
    title: s.title,
    affiliation: s.affiliation,
    tags: s.tags,
    headshot_url: s.headshot,
    bio_short: s.shortBio,
    bio_long: s.fullBio,
  };
}

function toEventSpeaker(r: any): EventSpeaker {
  return {
    id: r.id,
    eventId: r.event_id,
    speakerId: r.speaker_id,
    talkTitle: r.talk_title,
    talkDescription: r.talk_description,
    youtubeUrl: r.youtube_url ?? undefined,
    order: r.order,
  };
}

function fromEventSpeaker(es: Omit<EventSpeaker, "id">) {
  return {
    event_id: es.eventId,
    speaker_id: es.speakerId,
    talk_title: es.talkTitle,
    talk_description: es.talkDescription,
    youtube_url: es.youtubeUrl ?? null,
    order: es.order,
  };
}

function toTeamMember(r: any): TeamMember {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    committee: r.committee,
    headshot: r.headshot_url ?? "",
    blurb: r.blurb ?? undefined,
    isCurrent: r.is_current,
    yearsActive: r.years_active ?? undefined,
    linkedIn: r.linkedin_url ?? undefined,
  };
}

function fromTeamMember(m: Omit<TeamMember, "id">) {
  return {
    name: m.name,
    role: m.role,
    committee: m.committee,
    headshot_url: m.headshot,
    blurb: m.blurb ?? null,
    is_current: m.isCurrent,
    years_active: m.yearsActive ?? null,
    linkedin_url: m.linkedIn ?? null,
  };
}

function toPhoto(r: any): Photo {
  return {
    id: r.id,
    eventId: r.event_id,
    category: r.category ?? "",
    url: r.image_url ?? "",
    caption: r.caption ?? "",
    order: r.order,
  };
}

function toNewsPost(r: any): NewsPost {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    coverImage: r.cover_image_url ?? "",
    publishedAt: r.published_at,
    author: r.author,
  };
}

function fromNewsPost(p: Omit<NewsPost, "id">) {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    cover_image_url: p.coverImage,
    published_at: p.publishedAt,
    author: p.author,
  };
}

function toSiteSettings(r: any): SiteSettings {
  return {
    featuredEventId: r.featured_event_id ?? "",
    instagramUrl: r.instagram_url ?? "",
    youtubeUrl: r.youtube_url ?? "",
    emailAddress: r.email_address ?? "",
    twitterUrl: r.twitter_url ?? undefined,
    linkedInUrl: r.linkedin_url ?? undefined,
  };
}

function fromSiteSettings(s: Partial<SiteSettings>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (s.featuredEventId !== undefined)
    out.featured_event_id = s.featuredEventId;
  if (s.instagramUrl !== undefined) out.instagram_url = s.instagramUrl;
  if (s.youtubeUrl !== undefined) out.youtube_url = s.youtubeUrl;
  if (s.emailAddress !== undefined) out.email_address = s.emailAddress;
  if (s.twitterUrl !== undefined) out.twitter_url = s.twitterUrl;
  if (s.linkedInUrl !== undefined) out.linkedin_url = s.linkedInUrl;
  return out;
}

const defaultSettings: SiteSettings = {
  featuredEventId: "",
  instagramUrl: "",
  youtubeUrl: "",
  emailAddress: "",
};

interface DataContextType {
  loading: boolean;
  events: Event[];
  speakers: Speaker[];
  eventSpeakers: EventSpeaker[];
  teamMembers: TeamMember[];
  photos: Photo[];
  newsPosts: NewsPost[];
  siteSettings: SiteSettings;

  addEvent: (event: Omit<Event, "id">) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  addSpeaker: (speaker: Omit<Speaker, "id">) => Promise<void>;
  updateSpeaker: (id: string, speaker: Partial<Speaker>) => Promise<void>;
  deleteSpeaker: (id: string) => Promise<void>;

  addEventSpeaker: (eventSpeaker: Omit<EventSpeaker, "id">) => Promise<void>;
  updateEventSpeaker: (
    id: string,
    eventSpeaker: Partial<EventSpeaker>,
  ) => Promise<void>;
  deleteEventSpeaker: (id: string) => Promise<void>;

  addTeamMember: (member: Omit<TeamMember, "id">) => Promise<void>;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;

  addNewsPost: (post: Omit<NewsPost, "id">) => Promise<void>;
  updateNewsPost: (id: string, post: Partial<NewsPost>) => Promise<void>;
  deleteNewsPost: (id: string) => Promise<void>;

  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [eventSpeakers, setEventSpeakers] = useState<EventSpeaker[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [siteSettings, setSiteSettings] =
    useState<SiteSettings>(defaultSettings);
  const [settingsRowId, setSettingsRowId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAll() {
      const [
        eventsRes,
        speakersRes,
        esRes,
        teamRes,
        photosRes,
        newsRes,
        settingsRes,
      ] = await Promise.all([
        supabase.from("events").select("*").order("year", { ascending: false }),
        supabase.from("speakers").select("*").order("name"),
        supabase.from("event_speakers").select("*").order("order"),
        supabase.from("team_members").select("*").order("name"),
        supabase.from("photos").select("*").order("order"),
        supabase
          .from("news_posts")
          .select("*")
          .order("published_at", { ascending: false }),
        supabase.from("site_settings").select("*").maybeSingle(),
      ]);

      if (eventsRes.data) setEvents(eventsRes.data.map(toEvent));
      if (speakersRes.data) setSpeakers(speakersRes.data.map(toSpeaker));
      if (esRes.data) setEventSpeakers(esRes.data.map(toEventSpeaker));
      if (teamRes.data) setTeamMembers(teamRes.data.map(toTeamMember));
      if (photosRes.data) setPhotos(photosRes.data.map(toPhoto));
      if (newsRes.data) setNewsPosts(newsRes.data.map(toNewsPost));
      if (settingsRes.data) {
        setSiteSettings(toSiteSettings(settingsRes.data));
        setSettingsRowId(settingsRes.data.id);
      }

      setLoading(false);
    }

    loadAll();
  }, []);

  // Event CRUD
  const addEvent = useCallback(async (event: Omit<Event, "id">) => {
    const { data, error } = await supabase
      .from("events")
      .insert(fromEvent(event))
      .select()
      .single();
    if (error) throw error;
    setEvents((prev) => [toEvent(data), ...prev]);
  }, []);

  const updateEvent = useCallback(async (id: string, event: Partial<Event>) => {
    const dbRow: Record<string, unknown> = {};
    if (event.slug !== undefined) dbRow.slug = event.slug;
    if (event.name !== undefined) dbRow.name = event.name;
    if (event.theme !== undefined) dbRow.theme = event.theme;
    if (event.year !== undefined) dbRow.year = event.year;
    if (event.date !== undefined) dbRow.date = event.date;
    if (event.time !== undefined) dbRow.start_time = event.time;
    if (event.location !== undefined) dbRow.location_name = event.location;
    if (event.locationAddress !== undefined)
      dbRow.location_address = event.locationAddress;
    if (event.heroImage !== undefined) dbRow.hero_image_url = event.heroImage;
    if (event.description !== undefined) dbRow.description = event.description;
    if (event.isFlagship !== undefined) dbRow.is_flagship = event.isFlagship;
    if (event.albumUrl !== undefined) dbRow.album_url = event.albumUrl;

    const { data, error } = await supabase
      .from("events")
      .update(dbRow)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setEvents((prev) => prev.map((e) => (e.id === id ? toEvent(data) : e)));
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Speaker CRUD
  const addSpeaker = useCallback(async (speaker: Omit<Speaker, "id">) => {
    const { data, error } = await supabase
      .from("speakers")
      .insert(fromSpeaker(speaker))
      .select()
      .single();
    if (error) throw error;
    setSpeakers((prev) => [...prev, toSpeaker(data)]);
  }, []);

  const updateSpeaker = useCallback(
    async (id: string, speaker: Partial<Speaker>) => {
      const dbRow: Record<string, unknown> = {};
      if (speaker.slug !== undefined) dbRow.slug = speaker.slug;
      if (speaker.name !== undefined) dbRow.name = speaker.name;
      if (speaker.title !== undefined) dbRow.title = speaker.title;
      if (speaker.affiliation !== undefined)
        dbRow.affiliation = speaker.affiliation;
      if (speaker.tags !== undefined) dbRow.tags = speaker.tags;
      if (speaker.headshot !== undefined) dbRow.headshot_url = speaker.headshot;
      if (speaker.shortBio !== undefined) dbRow.bio_short = speaker.shortBio;
      if (speaker.fullBio !== undefined) dbRow.bio_long = speaker.fullBio;

      const { data, error } = await supabase
        .from("speakers")
        .update(dbRow)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setSpeakers((prev) =>
        prev.map((s) => (s.id === id ? toSpeaker(data) : s)),
      );
    },
    [],
  );

  const deleteSpeaker = useCallback(async (id: string) => {
    const { error } = await supabase.from("speakers").delete().eq("id", id);
    if (error) throw error;
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // EventSpeaker CRUD
  const addEventSpeaker = useCallback(
    async (eventSpeaker: Omit<EventSpeaker, "id">) => {
      const { data, error } = await supabase
        .from("event_speakers")
        .insert(fromEventSpeaker(eventSpeaker))
        .select()
        .single();
      if (error) throw error;
      setEventSpeakers((prev) => [...prev, toEventSpeaker(data)]);
    },
    [],
  );

  const updateEventSpeaker = useCallback(
    async (id: string, eventSpeaker: Partial<EventSpeaker>) => {
      const dbRow: Record<string, unknown> = {};
      if (eventSpeaker.eventId !== undefined)
        dbRow.event_id = eventSpeaker.eventId;
      if (eventSpeaker.speakerId !== undefined)
        dbRow.speaker_id = eventSpeaker.speakerId;
      if (eventSpeaker.talkTitle !== undefined)
        dbRow.talk_title = eventSpeaker.talkTitle;
      if (eventSpeaker.talkDescription !== undefined)
        dbRow.talk_description = eventSpeaker.talkDescription;
      if (eventSpeaker.youtubeUrl !== undefined)
        dbRow.youtube_url = eventSpeaker.youtubeUrl;
      if (eventSpeaker.order !== undefined) dbRow.order = eventSpeaker.order;

      const { data, error } = await supabase
        .from("event_speakers")
        .update(dbRow)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setEventSpeakers((prev) =>
        prev.map((es) => (es.id === id ? toEventSpeaker(data) : es)),
      );
    },
    [],
  );

  const deleteEventSpeaker = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("event_speakers")
      .delete()
      .eq("id", id);
    if (error) throw error;
    setEventSpeakers((prev) => prev.filter((es) => es.id !== id));
  }, []);

  // TeamMember CRUD
  const addTeamMember = useCallback(async (member: Omit<TeamMember, "id">) => {
    const { data, error } = await supabase
      .from("team_members")
      .insert(fromTeamMember(member))
      .select()
      .single();
    if (error) throw error;
    setTeamMembers((prev) => [...prev, toTeamMember(data)]);
  }, []);

  const updateTeamMember = useCallback(
    async (id: string, member: Partial<TeamMember>) => {
      const dbRow: Record<string, unknown> = {};
      if (member.name !== undefined) dbRow.name = member.name;
      if (member.role !== undefined) dbRow.role = member.role;
      if (member.committee !== undefined) dbRow.committee = member.committee;
      if (member.headshot !== undefined) dbRow.headshot_url = member.headshot;
      if (member.blurb !== undefined) dbRow.blurb = member.blurb;
      if (member.isCurrent !== undefined) dbRow.is_current = member.isCurrent;
      if (member.yearsActive !== undefined)
        dbRow.years_active = member.yearsActive;
      if (member.linkedIn !== undefined) dbRow.linkedin_url = member.linkedIn;

      const { data, error } = await supabase
        .from("team_members")
        .update(dbRow)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setTeamMembers((prev) =>
        prev.map((m) => (m.id === id ? toTeamMember(data) : m)),
      );
    },
    [],
  );

  const deleteTeamMember = useCallback(async (id: string) => {
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) throw error;
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // NewsPost CRUD
  const addNewsPost = useCallback(async (post: Omit<NewsPost, "id">) => {
    const { data, error } = await supabase
      .from("news_posts")
      .insert(fromNewsPost(post))
      .select()
      .single();
    if (error) throw error;
    setNewsPosts((prev) => [toNewsPost(data), ...prev]);
  }, []);

  const updateNewsPost = useCallback(
    async (id: string, post: Partial<NewsPost>) => {
      const dbRow: Record<string, unknown> = {};
      if (post.slug !== undefined) dbRow.slug = post.slug;
      if (post.title !== undefined) dbRow.title = post.title;
      if (post.excerpt !== undefined) dbRow.excerpt = post.excerpt;
      if (post.content !== undefined) dbRow.content = post.content;
      if (post.coverImage !== undefined)
        dbRow.cover_image_url = post.coverImage;
      if (post.publishedAt !== undefined) dbRow.published_at = post.publishedAt;
      if (post.author !== undefined) dbRow.author = post.author;

      const { data, error } = await supabase
        .from("news_posts")
        .update(dbRow)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setNewsPosts((prev) =>
        prev.map((p) => (p.id === id ? toNewsPost(data) : p)),
      );
    },
    [],
  );

  const deleteNewsPost = useCallback(async (id: string) => {
    const { error } = await supabase.from("news_posts").delete().eq("id", id);
    if (error) throw error;
    setNewsPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Site Settings
  const updateSiteSettings = useCallback(
    async (settings: Partial<SiteSettings>) => {
      const dbRow = fromSiteSettings(settings);
      if (settingsRowId) {
        const { error } = await supabase
          .from("site_settings")
          .update(dbRow)
          .eq("id", settingsRowId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("site_settings")
          .insert(dbRow)
          .select()
          .single();
        if (error) throw error;
        setSettingsRowId(data.id);
      }
      setSiteSettings((prev) => ({ ...prev, ...settings }));
    },
    [settingsRowId],
  );

  return (
    <DataContext.Provider
      value={{
        loading,
        events,
        speakers,
        eventSpeakers,
        teamMembers,
        photos,
        newsPosts,
        siteSettings,
        addEvent,
        updateEvent,
        deleteEvent,
        addSpeaker,
        updateSpeaker,
        deleteSpeaker,
        addEventSpeaker,
        updateEventSpeaker,
        deleteEventSpeaker,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        addNewsPost,
        updateNewsPost,
        deleteNewsPost,
        updateSiteSettings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
}
