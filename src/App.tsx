import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AdminLoginPage from "./pages/admin/Login";

// Public Pages
import HomePage from "./pages/Home";
import AboutPage from "./pages/About";
import EventsPage from "./pages/Events";
import EventDetailPage from "./pages/EventDetail";
import TalkDetailPage from "./pages/TalkDetail";
import SpeakersPage from "./pages/Speakers";
import TeamPage from "./pages/Team";
import AlumniPage from "./pages/Alumni";
import GalleryPage from "./pages/Gallery";
import NewsPage from "./pages/News";
import NewsDetailPage from "./pages/NewsDetail";
import NotFound from "./pages/NotFound";

// Admin
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEventsPage from "./pages/admin/Events";
import AdminSpeakersPage from "./pages/admin/Speakers";
import AdminTeamPage from "./pages/admin/Team";
import AdminNewsPage from "./pages/admin/News";
import AdminSettingsPage from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
          </BrowserRouter>
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
