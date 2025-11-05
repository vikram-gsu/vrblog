import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { blogPosts } from "@/data/blogPosts";
import { ArrowLeft } from "lucide-react";

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find(p => p.id === Number(id));
  
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post not found</h1>
          <Link to="/blog" className="link-underline">← Back to blog</Link>
        </div>
      </div>
    );
  }
  
  const currentIndex = blogPosts.findIndex(p => p.id === Number(id));
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-32 pb-24 px-6">
        <article className="container-narrow">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors mb-12"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-12 text-xs uppercase tracking-widest text-muted-foreground pb-8 border-b border-border">
            <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
            <span>•</span>
            <span>{post.readTime} read</span>
            <span>•</span>
            <div className="flex gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="text-primary">{tag}</span>
              ))}
            </div>
          </div>
          
          <div 
            className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-p:text-lg prose-p:leading-relaxed prose-code:bg-secondary prose-code:px-2 prose-code:py-1 prose-code:text-sm prose-pre:bg-secondary prose-pre:p-6"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
          />
          
          {/* Navigation */}
          <div className="mt-24 pt-12 border-t border-border flex justify-between">
            {prevPost ? (
              <Link to={`/blog/${prevPost.id}`} className="link-underline text-sm uppercase tracking-wide">
                ← {prevPost.title}
              </Link>
            ) : <div />}
            
            {nextPost && (
              <Link to={`/blog/${nextPost.id}`} className="link-underline text-sm uppercase tracking-wide text-right">
                {nextPost.title} →
              </Link>
            )}
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogPost;
