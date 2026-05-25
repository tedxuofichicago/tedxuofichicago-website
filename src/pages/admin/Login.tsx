import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { isAdminEmail } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "sending" }
    | { kind: "sent" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  // If already signed in as an admin, skip the login page.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session && isAdminEmail(session.user.email)) {
        navigate("/admin", { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!isAdminEmail(trimmed)) {
      setStatus({
        kind: "error",
        message: "That email is not authorized for admin access.",
      });
      return;
    }

    setStatus({ kind: "sending" });

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
        shouldCreateUser: true,
      },
    });

    if (error) {
      setStatus({ kind: "error", message: error.message });
      return;
    }

    setStatus({ kind: "sent" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Admin sign in</CardTitle>
            <CardDescription>
              Enter your authorized email to receive a magic sign-in link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status.kind === "sent" ? (
              <div className="text-sm">
                <p className="mb-2">
                  Check <strong>{email}</strong> for a sign-in link.
                </p>
                <p className="text-muted-foreground">
                  You can close this tab — the link will bring you back here.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {status.kind === "error" && (
                  <p className="text-sm text-destructive">{status.message}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={status.kind === "sending"}
                >
                  {status.kind === "sending"
                    ? "Sending link…"
                    : "Send magic link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
