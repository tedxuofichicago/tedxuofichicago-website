import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { SectionHeader } from "@/components/sections";
import { TeamMemberCard } from "@/components/cards";
import { supabase } from "@/lib/supabaseClient";
import type { TeamMember } from "@/types";

export default function AlumniPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlumni() {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_current", false) // only alumni
        .order("years_active", { ascending: false })
        .order("committee", { ascending: true });

      if (error) {
        console.error("Error loading alumni", error);
        setLoading(false);
        return;
      }

      const mapped: TeamMember[] = (data ?? []).map((m: any) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        committee: m.committee,
        isCurrent: m.is_current,
        headshot: m.headshot_url ?? "",
        blurb: m.blurb ?? undefined,
        yearsActive: m.years_active ?? undefined,
        linkedIn: m.linkedin_url ?? undefined,
      }));

      setMembers(mapped);
      setLoading(false);
    }

    loadAlumni();
  }, []);

  const alumni = members.filter((m) => !m.isCurrent);

  const alumniByYears = alumni.reduce(
    (acc, member) => {
      const years = member.yearsActive || "Other";
      if (!acc[years]) acc[years] = [];
      acc[years].push(member);
      return acc;
    },
    {} as Record<string, TeamMember[]>,
  );

  const sortedYears = Object.keys(alumniByYears).sort((a, b) => {
    const endYearA = parseInt(a.split("-")[1] || a);
    const endYearB = parseInt(b.split("-")[1] || b);
    return endYearB - endYearA;
  });

  if (loading) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container text-center">Loading alumni…</div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <SectionHeader
            title="Alumni"
            subtitle="Honoring the past leaders who built our legacy"
            centered
          />
        </div>
      </section>

      {/* Alumni by Years */}
      <section className="py-20">
        <div className="container">
          {sortedYears.length > 0 ? (
            sortedYears.map((years) => (
              <div key={years} className="mb-16 last:mb-0">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-2 h-8 bg-primary rounded-full" />
                  {years}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {alumniByYears[years].map((member) => (
                    <TeamMemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No alumni records yet. Check back soon!
            </p>
          )}
        </div>
      </section>

      {/* Alumni Network */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeader title="Stay Connected" centered />
            <p className="text-muted-foreground mb-6">
              Our alumni have gone on to do amazing things in fields ranging
              from technology and healthcare to arts and public service. If
              you're a TEDxUofIChicago alum, we'd love to stay in touch!
            </p>
            <p className="text-sm text-muted-foreground">
              Reach out to us at tedxuofichicago@gmail.com
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
