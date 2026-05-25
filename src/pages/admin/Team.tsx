import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import type { TeamMember } from "@/types";

const emptyMember: Omit<TeamMember, "id"> = {
  name: "",
  role: "",
  committee: "",
  headshot: "",
  blurb: "",
  isCurrent: true,
  yearsActive: "",
  linkedIn: "",
};

export default function AdminTeamPage() {
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember } =
    useData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<Omit<TeamMember, "id">>(emptyMember);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingMember) {
        await updateTeamMember(editingMember.id, formData);
      } else {
        await addTeamMember(formData);
      }
      handleClose();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData(member);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    try {
      await deleteTeamMember(id);
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete member.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingMember(null);
    setFormData(emptyMember);
  };

  const currentMembers = teamMembers.filter((m) => m.isCurrent);
  const alumni = teamMembers.filter((m) => !m.isCurrent);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Edit Member" : "Add Member"}
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
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="committee">Committee</Label>
                  <Input
                    id="committee"
                    value={formData.committee}
                    onChange={(e) =>
                      setFormData({ ...formData, committee: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsActive">Years Active</Label>
                  <Input
                    id="yearsActive"
                    value={formData.yearsActive}
                    onChange={(e) =>
                      setFormData({ ...formData, yearsActive: e.target.value })
                    }
                    placeholder="2023-2025"
                    required
                  />
                </div>
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
                <Label htmlFor="blurb">Bio</Label>
                <Textarea
                  id="blurb"
                  value={formData.blurb}
                  onChange={(e) =>
                    setFormData({ ...formData, blurb: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedIn">LinkedIn URL (optional)</Label>
                <Input
                  id="linkedIn"
                  value={formData.linkedIn || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedIn: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isCurrent"
                  checked={formData.isCurrent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isCurrent: checked })
                  }
                />
                <Label htmlFor="isCurrent">Current Team Member</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : editingMember ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Team */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          Current Team ({currentMembers.length})
        </h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Committee</TableHead>
                  <TableHead>Years</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={member.headshot}
                          alt={member.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.committee}</Badge>
                    </TableCell>
                    <TableCell>{member.yearsActive}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(member)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(member.id)}
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

      {/* Alumni */}
      <div>
        <h2 className="text-xl font-bold mb-4">Alumni ({alumni.length})</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Committee</TableHead>
                  <TableHead>Years</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumni.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={member.headshot}
                          alt={member.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.committee}</Badge>
                    </TableCell>
                    <TableCell>{member.yearsActive}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(member)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(member.id)}
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
    </div>
  );
}
