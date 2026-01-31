import matter from "gray-matter";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  tags: string[];
  featured: boolean;
  image?: string;
}

export interface Photo {
  id: string;
  src: string;
  description: string;
  category: string;
  date?: string;
}

export interface SeriesPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  posts: SeriesPost[];
}

// Import all blog markdown files
const blogFiles = import.meta.glob("/content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

// Import all series index files
const seriesIndexFiles = import.meta.glob("/content/series/*/index.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

// Import all series post files
const seriesPostFiles = import.meta.glob("/content/series/*/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

// Import all photography images
const photoFiles = import.meta.glob("/content/photography/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

// Import photo metadata
const photoMetaFiles = import.meta.glob("/content/photography/*.json", {
  eager: true,
});

export function getBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];

  for (const [path, content] of Object.entries(blogFiles)) {
    const slug = path.replace("/content/blog/", "").replace(".md", "");
    const { data, content: markdown } = matter(content as string);

    posts.push({
      slug,
      title: data.title || "Untitled",
      date: data.date || "",
      readTime: data.readTime || "5 min",
      excerpt: data.excerpt || "",
      content: markdown,
      tags: data.tags || [],
      featured: data.featured || false,
      image: data.image || undefined,
    });
  }

  // Sort by date (newest first)
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getBlogPost(slug: string): BlogPost | undefined {
  const posts = getBlogPosts();
  return posts.find((post) => post.slug === slug);
}

export function getPhotos(): Photo[] {
  const photos: Photo[] = [];

  for (const [path, src] of Object.entries(photoFiles)) {
    const filename = path.split("/").pop()?.replace(/\.(jpg|jpeg|png|webp)$/i, "") || "";
    const metaPath = path.replace(/\.(jpg|jpeg|png|webp)$/i, ".json");
    const meta = (photoMetaFiles[metaPath] as { default?: Record<string, string> })?.default || {};

    photos.push({
      id: filename,
      src: src as string,
      description: meta.description || "",
      category: meta.category || "uncategorized",
      date: meta.date,
    });
  }

  // Sort by date if available
  return photos.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0;
  });
}

export function getSeries(): Series[] {
  const seriesMap = new Map<string, Series>();

  // Parse series index files
  for (const [path, content] of Object.entries(seriesIndexFiles)) {
    const match = path.match(/\/content\/series\/([^/]+)\/index\.md$/);
    if (!match) continue;

    const seriesId = match[1];
    const { data } = matter(content as string);

    seriesMap.set(seriesId, {
      id: seriesId,
      title: data.title || seriesId,
      description: data.description || "",
      posts: [],
    });
  }

  // Parse series post files
  for (const [path, content] of Object.entries(seriesPostFiles)) {
    // Skip index files
    if (path.endsWith("index.md")) continue;

    const match = path.match(/\/content\/series\/([^/]+)\/(.+)\.md$/);
    if (!match) continue;

    const [, seriesId, postSlug] = match;
    const { data, content: markdown } = matter(content as string);

    const series = seriesMap.get(seriesId);
    if (series) {
      series.posts.push({
        slug: postSlug,
        title: data.title || "Untitled",
        date: data.date || "",
        readTime: data.readTime || "5 min",
        excerpt: data.excerpt || "",
        content: markdown,
      });
    }
  }

  // Sort posts within each series by slug (which includes order number)
  for (const series of seriesMap.values()) {
    series.posts.sort((a, b) => a.slug.localeCompare(b.slug));
  }

  return Array.from(seriesMap.values());
}

export function getSeriesById(id: string): Series | undefined {
  return getSeries().find((s) => s.id === id);
}

export function getSeriesPost(
  seriesId: string,
  postSlug: string
): { series: Series; post: SeriesPost; postIndex: number } | undefined {
  const series = getSeriesById(seriesId);
  if (!series) return undefined;

  const postIndex = series.posts.findIndex((p) => p.slug === postSlug);
  if (postIndex === -1) return undefined;

  return { series, post: series.posts[postIndex], postIndex };
}
