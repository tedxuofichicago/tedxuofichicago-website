import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { SectionHeader } from "@/components/sections";
import { NewsPostCard } from "@/components/cards";
import { supabase } from "@/lib/supabaseClient";
import type { NewsPost } from "@/types";

export default function NewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Error loading news posts", error);
        setLoading(false);
        return;
      }

      const mapped: NewsPost[] = (data ?? []).map((n: any) => ({
        id: n.id,
        slug: n.slug,
        title: n.title,
        excerpt: n.excerpt,
        content: n.content,
        coverImage: n.cover_image_url ?? "",
        publishedAt: n.published_at,
        author: n.author,
      }));

      setPosts(mapped);
      setLoading(false);
    }

    loadNews();
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <SectionHeader
            title="News"
            subtitle="Updates and announcements from our team"
            centered
          />
        </div>
      </section>

      {/* News Grid */}
      <section className="py-20">
        <div className="container">
          {loading ? (
            <p className="text-center text-muted-foreground py-12">
              Loading news…
            </p>
          ) : posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <NewsPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No news posts yet. Check back soon!
            </p>
          )}
        </div>
      </section>
    </Layout>
  );
}
