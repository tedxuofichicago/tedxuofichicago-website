import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const { events, siteSettings, updateSiteSettings } = useData();
  const { toast } = useToast();
  const [formData, setFormData] = useState(siteSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(siteSettings);
  }, [siteSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSiteSettings(formData);
      toast({
        title: "Settings saved",
        description: "Your site settings have been updated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Site Settings</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Featured Event</CardTitle>
              <CardDescription>
                Choose which event to highlight on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="featuredEvent">Featured Event</Label>
                <Select
                  value={formData.featuredEventId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, featuredEventId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.theme} ({event.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Update your organization's social media links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  value={formData.instagramUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, instagramUrl: e.target.value })
                  }
                  placeholder="https://instagram.com/yourusername"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube URL</Label>
                <Input
                  id="youtube"
                  value={formData.youtubeUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, youtubeUrl: e.target.value })
                  }
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter URL (optional)</Label>
                <Input
                  id="twitter"
                  value={formData.twitterUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, twitterUrl: e.target.value })
                  }
                  placeholder="https://twitter.com/yourusername"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL (optional)</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedInUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedInUrl: e.target.value })
                  }
                  placeholder="https://linkedin.com/company/yourorg"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>
                Your primary contact email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, emailAddress: e.target.value })
                  }
                  placeholder="hello@example.com"
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
