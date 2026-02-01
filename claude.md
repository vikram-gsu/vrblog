# Vikram Pareddy's Personal Blog

This is a personal blog and portfolio website for Vikram Pareddy, a software engineer and technical writer. The site showcases blog posts, article series, and professional information.

## Overview

A modern, content-focused web application built with React and TypeScript that serves as a personal platform for technical writing and professional presence. The site features a clean, accessible design with dark mode support and markdown-based content management.

## Tech Stack

### Core Technologies
- **Vite** - Build tool and development server
- **React 18.3** - UI framework
- **TypeScript 5.8** - Type-safe JavaScript
- **React Router 6.30** - Client-side routing

### UI & Styling
- **shadcn/ui** - Component library built on Radix UI primitives
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **next-themes** - Dark mode support

### Content & Data
- **react-markdown** - Markdown rendering with GitHub Flavored Markdown support
- **YAML** - Frontmatter parsing for blog post metadata
- **date-fns** - Date formatting and manipulation

### State & Forms
- **TanStack Query (React Query)** - Server state management
- **React Hook Form** - Form state management
- **Zod** - Schema validation

## Project Structure

```
vikram-pareddy-blog/
├── src/
│   ├── components/       # Reusable React components
│   │   └── ui/          # shadcn/ui components
│   ├── hooks/           # Custom React hooks (e.g., useTheme)
│   ├── lib/             # Utility functions
│   ├── pages/           # Route components
│   │   ├── About.tsx
│   │   ├── Blog.tsx
│   │   ├── BlogPost.tsx
│   │   ├── Series.tsx
│   │   ├── SeriesDetail.tsx
│   │   ├── SeriesPost.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx          # Main app component with routing
│   └── main.tsx         # Entry point
├── content/             # Markdown content files
│   ├── blog/           # Individual blog posts (.md)
│   ├── photography/    # Photos with metadata (.jpg + .json)
│   └── series/         # Multi-part series (folders with index.md)
└── public/             # Static assets
    └── assets/         # Images and media files
        ├── blog/       # Blog post images
        ├── profile/    # Personal photos (About page, etc.)
        └── general/    # Logos, icons, shared assets

```

## Key Features

### Blog System
- Markdown-based blog posts with frontmatter metadata
- Tags and categorization
- Featured posts
- Estimated read time
- Date-based sorting (newest first)
- Individual post pages with full markdown rendering

### Series
- Multi-part article series organized in folders
- Sequential numbering (01-, 02-, etc.)
- Series index pages with descriptions
- Navigation between series posts
- Individual series post pages

### Content Structure
Blog posts include metadata:
```yaml
---
title: "Post Title"
date: "2024-11-15"
readTime: "5 min"
excerpt: "Brief description"
tags:
  - javascript
  - tutorial
featured: false
image: ""
---
```

### UI/UX
- Responsive design for all screen sizes
- Dark mode with system preference detection
- Smooth page transitions
- Accessible components (ARIA-compliant via Radix UI)
- Toast notifications (via Sonner)
- Loading states and error handling

### Pages
1. **Home (/)** - Blog listing page
2. **/blog/:slug** - Individual blog post
3. **/series** - Series listing
4. **/series/:seriesId** - Series detail with all posts
5. **/series/:seriesId/:postSlug** - Individual series post
6. **/about** - About page

## Content Management

### Adding Blog Posts
Create a `.md` file in `content/blog/`. The filename becomes the URL slug.

Example: `content/blog/my-new-post.md`

### Adding Series
1. Create folder in `content/series/`
2. Add `index.md` with series metadata
3. Add numbered posts (`01-title.md`, `02-title.md`)

### Photos
Add images to `content/photography/` with matching `.json` metadata files containing description, category, and date.

### Assets
Store images and other media in `public/assets/`:
- `assets/blog/` - Blog post images
- `assets/profile/` - Personal photos (headshot, About page images)
- `assets/general/` - Logos, icons, and shared assets

Reference in markdown: `![alt](/assets/blog/image.jpg)`
Reference in components: `<img src="/assets/profile/headshot.jpg" />`

## Development

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build          # Production build
npm run build:dev      # Development build
npm run preview        # Preview production build
```

### Linting
```bash
npm run lint
```

## Architecture Patterns

### Providers & Context
- **ThemeProvider** - Manages dark/light mode state
- **TooltipProvider** - Global tooltip configuration
- **QueryClientProvider** - React Query cache and state

### Component Organization
- UI components in `components/ui/` following shadcn/ui patterns
- Page components in `pages/` handling routing
- Custom hooks in `hooks/` for reusable logic
- Utilities in `lib/` for shared functions

### Styling Approach
- Utility-first with Tailwind CSS
- Component variants using `class-variance-authority`
- Consistent design tokens via Tailwind config
- Dark mode using CSS variables and next-themes

## SEO & Metadata

The site includes comprehensive meta tags:
- Open Graph tags for social sharing
- Twitter Card metadata
- Canonical URLs
- Semantic HTML structure
- Descriptive page titles

## Deployment

The application can be deployed to any static hosting service:
- **Vercel** - Automatic deployments from Git
- **Netlify** - Continuous deployment with Git integration
- **GitHub Pages** - Free hosting for static sites
- **Cloudflare Pages** - Fast global CDN

Build the production bundle with `npm run build` and deploy the `dist/` folder.

## Git Workflow

- Main branch: `main`
- Standard Git workflow with feature branches
- Commit changes locally and push to remote repository

## Personal Information

**Owner:** Vikram Pareddy
**Role:** Software Engineer & Technical Writer
**Domain:** vikrampareddy.dev
**Focus:** Python, software design patterns, maintainable code
