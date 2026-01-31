import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { getSeriesPost } from "@/lib/content";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SeriesPost = () => {
  const { seriesId, postSlug } = useParams();
  const result = useMemo(() => getSeriesPost(seriesId || "", postSlug || ""), [seriesId, postSlug]);
  
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post not found</h1>
          <Link to="/series" className="link-underline">← Back to series</Link>
        </div>
      </div>
    );
  }
  
  const { series, post, postIndex } = result;
  const nextPost = postIndex < series.posts.length - 1 ? series.posts[postIndex + 1] : null;
  const prevPost = postIndex > 0 ? series.posts[postIndex - 1] : null;
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-32 pb-24 px-6">
        <article className="container-narrow">
          <Link 
            to={`/series/${seriesId}`}
            className="inline-flex items-center gap-2 text-sm tracking-wide text-muted-foreground hover:text-primary transition-colors mb-12"
          >
            <ArrowLeft size={16} />
            Back to {series.title}
          </Link>
          
          <div className="mb-6 text-sm uppercase tracking-wide text-primary">
            Part {postIndex + 1} of {series.posts.length}
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-12 text-xs uppercase tracking-widest text-muted-foreground pb-8 border-b border-border">
            <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
            <span>•</span>
            <span>{post.readTime} read</span>
          </div>
          
          <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-p:text-lg prose-p:leading-relaxed prose-code:bg-secondary prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-secondary prose-pre:p-6 prose-pre:rounded-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:my-6 prose-li:my-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
          
          {/* Navigation */}
          <div className="mt-24 pt-12 border-t border-border flex justify-between">
            {prevPost ? (
              <Link 
                to={`/series/${seriesId}/${prevPost.slug}`} 
                className="link-underline text-sm tracking-wide"
              >
                ← Part {postIndex}: {prevPost.title}
              </Link>
            ) : <div />}
            
            {nextPost && (
              <Link 
                to={`/series/${seriesId}/${nextPost.slug}`}
                className="link-underline text-sm tracking-wide text-right"
              >
                Part {postIndex + 2}: {nextPost.title} →
              </Link>
            )}
          </div>
        </article>
      </main>
    </div>
  );
};

export default SeriesPost;
