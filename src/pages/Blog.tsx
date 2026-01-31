import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { blogPosts } from "@/data/blogPosts";

const toPascalCase = (str: string) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-32 pb-24 px-6">
        <div className="container-narrow">
          <h1 className="text-display mb-8">Writing</h1>
          
          {/* Search and filters */}
          <div className="mb-16 space-y-6">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-b border-border py-3 text-lg focus:outline-none focus:border-primary transition-colors"
            />
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 text-sm tracking-wide transition-colors rounded-full ${
                  !selectedTag ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 text-sm tracking-wide transition-colors rounded-full ${
                    selectedTag === tag ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {toPascalCase(tag)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Posts list */}
          <div className="space-y-16">
            {filteredPosts.map((post, index) => (
              <article key={post.id}>
                <Link to={`/blog/${post.id}`} className="group block">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-4 mb-4 text-xs uppercase tracking-widest text-muted-foreground">
                    <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                    <span>•</span>
                    <span>{post.readTime} read</span>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex gap-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs tracking-wide text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {toPascalCase(tag)}
                      </span>
                    ))}
                  </div>
                </Link>
                {index < filteredPosts.length - 1 && (
                  <hr className="mt-16 border-border" />
                )}
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Blog;
