import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Mic,
  Newspaper,
  Settings,
  ArrowLeft,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { isAdminEmail } from "@/lib/adminAuth";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/speakers", label: "Speakers", icon: Mic },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "forbidden"; email: string }
  | { status: "authorized"; email: string };

export function AdminLayout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    const apply = (email: string | null | undefined) => {
      if (cancelled) return;
      if (!email) {
        setAuth({ status: "unauthenticated" });
      } else if (isAdminEmail(email)) {
        setAuth({ status: "authorized", email });
      } else {
        setAuth({ status: "forbidden", email });
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      apply(data.session?.user.email);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session?.user.email);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (auth.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (auth.status === "unauthenticated") {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (auth.status === "forbidden") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-3">Not authorized</h1>
          <p className="text-muted-foreground mb-6">
            <strong>{auth.email}</strong> is not on the admin allowlist.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={handleSignOut} variant="outline">
              Sign out
            </Button>
            <Button asChild>
              <Link to="/">Back to site</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Site</span>
            </Link>
            <span className="text-xl font-bold">
              <span className="text-primary">TEDx</span>
              <span className="text-foreground">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {auth.email}
            </span>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r bg-muted/30 p-4">
          <nav className="space-y-1">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href, item.exact)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
