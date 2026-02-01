# Assets Folder

This folder contains images and other static assets used throughout the site.

## Structure

```
assets/
├── blog/        # Images for blog posts
├── profile/     # Personal photos (About page, headshot, etc.)
└── general/     # Other shared assets (logos, icons, backgrounds)
```

## Usage

### In Blog Posts (Markdown)

Reference images using absolute paths from the public directory:

```markdown
![Alt text](/assets/blog/my-image.jpg)
```

### In React Components

Use absolute paths from the public directory:

```tsx
<img src="/assets/profile/headshot.jpg" alt="Vikram Pareddy" />
```

### In CSS

```css
background-image: url('/assets/general/background.jpg');
```

## File Organization

### blog/
Store images used in blog posts. Consider organizing by post slug or date:
- `blog/post-slug-image.jpg`
- `blog/2024-01-15-diagram.png`

### profile/
Store personal photos:
- `profile/headshot.jpg` - Main profile photo
- `profile/about-banner.jpg` - About page banner
- `profile/social-card.jpg` - Social media preview image

### general/
Store site-wide assets:
- `general/logo.png`
- `general/favicon.ico`
- `general/og-image.jpg` - Default Open Graph image

## Supported Formats

- Images: `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`, `.gif`
- Other: `.pdf`, `.ico`, etc.

## Best Practices

1. **Optimize images** before uploading (compress, resize appropriately)
2. **Use descriptive names**: `python-decorators-diagram.png` not `image1.png`
3. **Keep file sizes reasonable**: Aim for < 500KB for photos, < 100KB for diagrams
4. **Use WebP** format when possible for better compression
5. **Add alt text** for accessibility when using images

## Example

For a blog post about Python decorators at `content/blog/understanding-python-decorators.md`:

1. Add diagram: `public/assets/blog/python-decorators-diagram.png`
2. Reference in markdown:
   ```markdown
   ![Python decorator pattern diagram](/assets/blog/python-decorators-diagram.png)
   ```
