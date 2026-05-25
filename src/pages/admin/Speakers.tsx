import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Speaker } from "@/types";

const emptySpeaker: Omit<Speaker, "id"> = {
  slug: "",
  name: "",
  title: "",
  affiliation: "",
  tags: [],
  headshot: "",
  shortBio: "",
  fullBio: "",
};

export default function AdminSpeakersPage() {
  const { speakers, addSpeaker, updateSpeaker, deleteSpeaker } = useData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [formData, setFormData] = useState<Omit<Speaker, "id">>(emptySpeaker);
  const [tagsInput, setTagsInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    setSaving(true);
    try {
      if (editingSpeaker) {
        await updateSpeaker(editingSpeaker.id, data);
      } else {
        await addSpeaker(data);
      }
      handleClose();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save speaker. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (speaker: Speaker) => {
    setEditingSpeaker(speaker);
    setFormData(speaker);
    setTagsInput(speaker.tags.join(", "));
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this speaker?")) return;
    try {
      await deleteSpeaker(id);
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete speaker.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingSpeaker(null);
    setFormData(emptySpeaker);
    setTagsInput("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Speakers</h1>
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Speaker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSpeaker ? "Edit Speaker" : "Add Speaker"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affiliation">Affiliation</Label>
                  <Input
                    id="affiliation"
                    value={formData.affiliation}
                    onChange={(e) =>
                      setFormData({ ...formData, affiliation: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Science, Technology, Innovation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headshot">Headshot URL</Label>
                <Input
                  id="headshot"
                  value={formData.headshot}
                  onChange={(e) =>
                    setFormData({ ...formData, headshot: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortBio">Short Bio</Label>
                <Textarea
                  id="shortBio"
                  value={formData.shortBio}
                  onChange={(e) =>
                    setFormData({ ...formData, shortBio: e.target.value })
                  }
                  rows={2}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullBio">Full Bio</Label>
                <Textarea
                  id="fullBio"
                  value={formData.fullBio}
                  onChange={(e) =>
                    setFormData({ ...formData, fullBio: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : editingSpeaker ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Speaker</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Affiliation</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {speakers.map((speaker) => (
                <TableRow key={speaker.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={speaker.headshot}
                        alt={speaker.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <span className="font-medium">{speaker.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{speaker.title}</TableCell>
                  <TableCell>{speaker.affiliation}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {speaker.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(speaker)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(speaker.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
