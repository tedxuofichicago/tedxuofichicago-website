import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import type { NewsPost } from "@/types";

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function loadPost() {
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("Error loading news post", error);
        setLoading(false);
        return;
      }

      if (data) {
        setPost({
          id: data.id,
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          coverImage: data.cover_image_url ?? "",
          publishedAt: data.published_at,
          author: data.author,
        });
      }
      setLoading(false);
    }

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-20 text-center">Loading article…</div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <Button asChild>
            <Link to="/news">Back to News</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-4xl font-bold mt-8 mb-4">
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-2xl font-bold mt-6 mb-3">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-6 mb-1">
            {line.slice(2)}
          </li>
        );
      }
      if (line.trim() === "") {
        return <br key={index} />;
      }
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={index} className="mb-4">
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="text-primary">
                {part}
              </strong>
            ) : (
              part
            ),
          )}
        </p>
      );
    });
  };

  return (
    <Layout>
      {/* Navigation */}
      <section className="py-8 border-b">
        <div className="container">
          <Link
            to="/news"
            className="inline-flex items-center text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to News
          </Link>
        </div>
      </section>

      {/* Article */}
      <article className="py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <header className="mb-8">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {post.title}
              </h1>
              {post.coverImage && (
                <div className="aspect-video rounded-lg overflow-hidden border">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </header>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              {renderContent(post.content)}
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
}
