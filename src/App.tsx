import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Public Pages
const HomePage = lazy(() => import("./pages/Home"));
const AboutPage = lazy(() => import("./pages/About"));
const EventsPage = lazy(() => import("./pages/Events"));
const EventDetailPage = lazy(() => import("./pages/EventDetail"));
const TalkDetailPage = lazy(() => import("./pages/TalkDetail"));
const SpeakersPage = lazy(() => import("./pages/Speakers"));
const TeamPage = lazy(() => import("./pages/Team"));
const AlumniPage = lazy(() => import("./pages/Alumni"));
const GalleryPage = lazy(() => import("./pages/Gallery"));
const NewsPage = lazy(() => import("./pages/News"));
const NewsDetailPage = lazy(() => import("./pages/NewsDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin
const AdminLayout = lazy(() =>
  import("./components/admin/AdminLayout").then((m) => ({
    default: m.AdminLayout,
  })),
);
const AdminLoginPage = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminEventsPage = lazy(() => import("./pages/admin/Events"));
const AdminSpeakersPage = lazy(() => import("./pages/admin/Speakers"));
const AdminTeamPage = lazy(() => import("./pages/admin/Team"));
const AdminNewsPage = lazy(() => import("./pages/admin/News"));
const AdminSettingsPage = lazy(() => import("./pages/admin/Settings"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:slug" element={<EventDetailPage />} />
                <Route
                  path="/events/:eventSlug/speakers/:speakerSlug"
                  element={<TalkDetailPage />}
                />
                <Route path="/speakers" element={<SpeakersPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/alumni" element={<AlumniPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:slug" element={<NewsDetailPage />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="events" element={<AdminEventsPage />} />
                  <Route path="speakers" element={<AdminSpeakersPage />} />
                  <Route path="team" element={<AdminTeamPage />} />
                  <Route path="news" element={<AdminNewsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
