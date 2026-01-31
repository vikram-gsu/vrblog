import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { getSeriesById } from "@/lib/content";
import { ArrowLeft } from "lucide-react";

const SeriesDetail = () => {
  const { seriesId } = useParams();
  const currentSeries = useMemo(() => getSeriesById(seriesId || ""), [seriesId]);
  
  if (!currentSeries) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Series not found</h1>
          <Link to="/series" className="link-underline">← Back to series</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-32 pb-24 px-6">
        <div className="container-narrow">
          <Link 
            to="/series" 
            className="inline-flex items-center gap-2 text-sm tracking-wide text-muted-foreground hover:text-primary transition-colors mb-12"
          >
            <ArrowLeft size={16} />
            Back to Series
          </Link>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {currentSeries.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-16 leading-relaxed">
            {currentSeries.description}
          </p>
          
          <div className="space-y-12">
            {currentSeries.posts.map((post, index) => (
              <article key={post.slug} className="group">
                <Link to={`/series/${seriesId}/${post.slug}`}>
                  <div className="flex gap-6 items-start">
                    <div className="text-5xl font-bold text-primary/20 min-w-[60px]">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <div className="flex items-center gap-4 mb-4 text-xs uppercase tracking-widest text-muted-foreground">
                        <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                        <span>•</span>
                        <span>{post.readTime} read</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
                {index < currentSeries.posts.length - 1 && (
                  <hr className="mt-12 border-border" />
                )}
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SeriesDetail;
