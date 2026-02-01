# Vikram Pareddy's Personal Blog

A personal blog and portfolio website for Vikram Pareddy, showcasing technical writing, blog posts, and article series.

## Tech Stack

- **Vite** - Build tool and development server
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **shadcn/ui** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **react-markdown** - Markdown rendering

## Getting Started

### Prerequisites

- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd vikram-pareddy-blog

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Project Structure

```
vikram-pareddy-blog/
├── src/
│   ├── components/       # React components
│   ├── pages/           # Route components
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utilities
├── content/
│   ├── blog/           # Blog posts (.md)
│   ├── series/         # Article series
│   └── photography/    # Photos with metadata
└── public/
    └── assets/         # Images and static files
```

## Content Management

### Adding Blog Posts

Create a `.md` file in `content/blog/`:

```markdown
---
title: "Post Title"
date: "2024-01-15"
readTime: "5 min"
excerpt: "Brief description"
tags:
  - javascript
  - tutorial
featured: false
---

Your content here...
```

### Adding Series

1. Create folder in `content/series/`
2. Add `index.md` with series metadata
3. Add numbered posts (`01-title.md`, `02-title.md`)

### Adding Images

Store images in `public/assets/`:
- `assets/blog/` - Blog post images
- `assets/profile/` - Personal photos
- `assets/general/` - Logos and icons

Reference in markdown: `![alt](/assets/blog/image.jpg)`

## Deployment

This application can be deployed to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

Build the project with `npm run build` and deploy the `dist/` folder.

## License

Personal project - All rights reserved.
