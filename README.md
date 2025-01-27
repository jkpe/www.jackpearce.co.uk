# www.jackpearce.co.uk

This is a static blog focused on home automation, networking, and system administration. The site is built using a custom static site generator that converts markdown files to HTML.

## Technologies

- **Node.js** - Core runtime for the build process
- **Markdown** - Content authoring format
- **HTML/CSS** - Static site output
- **Giscus** - GitHub-based commenting system
- **RSS** - Feed generation for content syndication

## Project Structure

```
.
├── build.js              # Main build script
├── templates/            # HTML templates
│   ├── index.html       # Homepage template
│   └── post.html        # Individual post template
├── posts/               # Markdown content
│   └── *.md            # Individual post files
├── static/              # Static assets
│   └── styles.css      # Optional additional styles
└── dist/               # Generated site
    ├── index.html      # Generated homepage
    ├── rss.xml         # Generated RSS feed
    └── posts/          # Generated post HTML files
```

## Content Authoring

Posts are written in Markdown with YAML frontmatter. Each post should include:

```markdown
---
title: Post Title
date: YYYY-MM-DD
category: Category Name
slug: url-friendly-title
---

Post content in Markdown...
```

### Required Frontmatter Fields

- `title`: Post title
- `date`: Publication date (YYYY-MM-DD format)
- `category`: Post category (e.g., "Home Automation", "Networking")
- `slug`: URL-friendly identifier (optional, will be generated from title if not provided)

## Build Process

The site uses a custom Node.js build script that:

1. Processes Markdown files with frontmatter
2. Converts Markdown to HTML with syntax highlighting
3. Calculates reading time for each post
4. Generates individual post pages using the post template
5. Creates an index page with category filtering
6. Generates an RSS feed
7. Minifies HTML output

### Building the Site

```bash
# Install dependencies
npm install marked gray-matter html-minifier highlight.js

# Run build
node build.js
```

## Features

### Dark Mode
- Automatic system preference detection
- Manual toggle with persistent preference
- Syncs across pages
- Affects Giscus comments theme

### Category Filtering
- Dynamic category generation from posts
- Interactive filtering on the homepage
- Preserves filter state during navigation

### RSS Feed
- Automatically generated from posts
- Includes full post metadata
- Sorted by publication date

### Comments
- Powered by Giscus
- GitHub Discussions backend
- Automatic theme syncing
- Reaction support

## Templates

### Index Template (`templates/index.html`)
- Category filtering system
- Card-based post layout
- Dark mode support
- Responsive design

### Post Template (`templates/post.html`)
- Article formatting
- Code syntax highlighting
- Reading time display
- Giscus comments integration
- Navigation links

## Development

### Dependencies

```json
{
  "dependencies": {
    "marked": "For Markdown processing",
    "gray-matter": "For frontmatter parsing",
    "html-minifier": "For output optimization",
    "highlight.js": "For code syntax highlighting"
  }
}
```

### Adding New Features

1. Update relevant template (`templates/index.html` or `templates/post.html`)
2. Modify build script (`build.js`) to support new functionality
3. Test build process
4. Deploy updated files

## Deployment

The `dist/` directory contains the complete static site ready for deployment. Deploy these files to your web server or static hosting service.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Add your license information here]