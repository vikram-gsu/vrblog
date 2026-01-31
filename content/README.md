# Content Folder

This folder contains all your blog posts, photography, and series content.

## Structure

```
content/
├── blog/                    # Blog posts as Markdown files
│   └── my-post-title.md
├── photography/             # Photos and metadata
│   ├── photo-name.jpg
│   └── photo-name.json      # Metadata for the photo
└── series/                  # Multi-part series
    └── series-name/
        ├── index.md         # Series title and description
        ├── 01-first-post.md
        └── 02-second-post.md
```

## Adding Blog Posts

Create a new `.md` file in `content/blog/`. The filename becomes the URL slug.

**Example:** `content/blog/my-new-post.md`

```markdown
---
title: "My New Post"
date: "2024-11-15"
readTime: "5 min"
excerpt: "A brief description of the post."
tags:
  - javascript
  - tutorial
featured: false
image: ""
---

Your markdown content here...

## Headings work

- Lists work
- **Bold** and *italic* work

\`\`\`javascript
// Code blocks work too
const greeting = "Hello!";
\`\`\`
```

## Adding Photos

1. Add your image to `content/photography/` (supports `.jpg`, `.jpeg`, `.png`, `.webp`)
2. Create a matching `.json` file with the same name

**Example:** For `sunset-beach.jpg`, create `sunset-beach.json`:

```json
{
  "description": "Golden hour at the beach, capturing the last light of day.",
  "category": "landscape",
  "date": "2024-10-15"
}
```

### Categories

Use categories to filter photos: `landscape`, `portrait`, `street`, `architecture`, `nature`, `travel`, etc.

## Adding Series

1. Create a folder in `content/series/` with your series slug
2. Add an `index.md` with series metadata
3. Add numbered post files (`01-title.md`, `02-title.md`, etc.)

**Example:** `content/series/my-series/index.md`

```markdown
---
title: "My Series Title"
description: "A description of what this series covers."
---
```

**Post files:** `content/series/my-series/01-introduction.md`

```markdown
---
title: "Introduction"
date: "2024-10-01"
readTime: "8 min"
excerpt: "Brief description of this part."
---

Content goes here...
```

## Tips

- **Blog posts** are sorted by date (newest first)
- **Series posts** are sorted by filename (use number prefixes like `01-`, `02-`)
- **Photos** are sorted by date if provided in metadata
- All markdown supports GitHub Flavored Markdown (tables, strikethrough, etc.)
