import { Link } from "react-router-dom";
import { Instagram, Youtube, Mail, Twitter, Linkedin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function Footer() {
  const { settings } = useSiteSettings();

  return (
    <footer className="border-t bg-secondary/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold">
                <span className="text-primary">TEDx</span>
                <span className="text-foreground">UofIChicago</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Ideas worth spreading at the University of Illinois Chicago.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  About TEDx
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  to="/speakers"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Speakers
                </Link>
              </li>
              <li>
                <Link
                  to="/team"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Our Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          {settings && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Connect With Us
              </h3>
              <div className="mt-4 flex gap-4">
                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {settings.youtubeUrl && (
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
                {settings.twitterUrl && (
                  <a
                    href={settings.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {settings.linkedInUrl && (
                  <a
                    href={settings.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {settings.emailAddress && (
                  <a
                    href={`mailto:${settings.emailAddress}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                )}
              </div>
              {settings.emailAddress && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {settings.emailAddress}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>This independent TEDx event is operated under license from TED.</p>
          <p className="mt-2">
            © {new Date().getFullYear()} TEDxUofIChicago. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
