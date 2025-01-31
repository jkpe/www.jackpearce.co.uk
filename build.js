// build.js
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');
const { minify } = require('html-minifier');
const generateRSS = require('./rss');

// Site metadata
const siteMetadata = {
    title: "Jack's Tech Blog",
    description: 'Exploring home automation, cloud architecture, and artificial intelligence.',
    siteUrl: 'https://www.jackpearce.co.uk',
    author: 'Jack Pearce',
    social: {
        github: 'https://github.com/jkpe',
        linkedin: 'https://linkedin.com/in/pearcejack'
    }
};

// Configure marked
const highlight = require('highlight.js');
marked.setOptions({
    highlight: (code, lang) => {
        if (lang && highlight.getLanguage(lang)) {
            return highlight.highlight(code, { language: lang }).value;
        }
        return highlight.highlightAuto(code).value;
    },
    gfm: true
});

// Helper functions
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

// Helper function to strip HTML and clean text
const sanitizeText = (html) => {
    // First remove HTML tags
    const text = html.replace(/<[^>]*>/g, ' ')
        // Replace multiple spaces/newlines with single space
        .replace(/\s+/g, ' ')
        // Trim spaces from ends
        .trim()
        // Escape special characters
        .replace(/[<>&"']/g, (match) => {
            const entities = {
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return entities[match];
        });
    return text;
};

const generateMetadata = (post, siteMetadata) => {
    const isoDate = new Date(post.date).toISOString();
    const isoModifiedDate = post.modified ? new Date(post.modified).toISOString() : isoDate;
    
    // Generate description, sanitize it, and limit to 160 characters
    let description = post.description || post.content;
    description = sanitizeText(description);
    description = description.length > 160 ? `${description.slice(0, 157)}...` : description;
    
    const url = `${siteMetadata.siteUrl}/posts/${post.slug}`;
    const imageUrl = post.featuredImage 
        ? `${siteMetadata.siteUrl}/images/posts/${post.featuredImage}`
        : `${siteMetadata.siteUrl}${siteMetadata.defaultImage}`;

    return {
        ...post,
        description,
        isoDate,
        isoModifiedDate,
        url,
        imageUrl,
        baseUrl: siteMetadata.siteUrl,
        fullTitle: `${post.title} | ${siteMetadata.title}`,
        keywords: post.tags ? post.tags.join(', ') : post.category
    };
};

// Generate post HTML
async function generatePost(metadata, htmlContent) {
    try {
        const template = await fs.readFile(
            path.join(__dirname, 'templates', 'post.html'),
            'utf-8'
        );
        
        // Format the date for display
        const formattedDate = new Date(metadata.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });

        const replacements = {
            '{{title}}': metadata.title,
            '{{fullTitle}}': metadata.fullTitle,
            '{{description}}': metadata.description,
            '{{keywords}}': metadata.keywords,
            '{{date}}': formattedDate,
            '{{isoDate}}': metadata.isoDate,
            '{{isoModifiedDate}}': metadata.isoModifiedDate,
            '{{category}}': metadata.category,
            '{{readTime}}': metadata.readTime,
            '{{content}}': htmlContent,
            '{{baseUrl}}': metadata.baseUrl,
            '{{slug}}': metadata.slug,
            '{{featuredImage}}': metadata.featuredImage || siteMetadata.defaultImage,
            '{{tags}}': metadata.tags ? metadata.tags.map(tag => 
                `<meta property="article:tag" content="${tag}">`
            ).join('\n') : ''
        };

        let result = template;
        for (const [placeholder, value] of Object.entries(replacements)) {
            result = result.replaceAll(placeholder, value || '');
        }

        return result;
    } catch (error) {
        console.error('Error generating post HTML:', error);
        throw error;
    }
}

// Process individual post
async function processPost(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data: metadata, content: markdown } = matter(content);
    
    if (!metadata.slug) {
        metadata.slug = generateSlug(metadata.title);
    }

    const htmlContent = marked(markdown);
    const readTime = calculateReadTime(markdown);
    
    // Generate complete metadata
    const enrichedMetadata = generateMetadata(
        { ...metadata, content: htmlContent, readTime },
        siteMetadata
    );

    // Generate and minify HTML
    const postHtml = await generatePost(enrichedMetadata, htmlContent);
    const minifiedHtml = minify(postHtml, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
    });

    const outputPath = path.join(__dirname, 'dist', 'posts', `${metadata.slug}.html`);
    await fs.writeFile(outputPath, minifiedHtml);

    return enrichedMetadata;
}

// Generate index HTML
async function generateIndex(posts) {
    const template = await fs.readFile(
        path.join(__dirname, 'templates/index.html'),
        'utf-8'
    );
    
    // Generate categories
    const categories = [...new Set(posts.map(post => post.category))];
    const categoryTags = categories
        .map(category => `
            <button class="category-tag" data-category="${category}">${category}</button>
        `)
        .join('\n');

    // Generate posts HTML
    const postsHtml = posts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(post => `
            <li class="post-item" data-category="${post.category}">
                <div class="post-date">
                    ${new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
                <div class="post-content">
                    <div class="post-category">${post.category}</div>
                    <h2 class="post-title">
                        <a href="/posts/${post.slug}.html">${post.title}</a>
                    </h2>
                </div>
            </li>
        `)
        .join('\n');

    // Replace template variables
    const indexHtml = template
        .replace('{{baseUrl}}', siteMetadata.siteUrl)
        .replace('{{categories}}', categoryTags)
        .replace('{{posts}}', postsHtml);

    return indexHtml;
}

// Main build function
async function build() {
    try {
        // Create output directories
        await fs.mkdir('dist', { recursive: true });
        await fs.mkdir('dist/posts', { recursive: true });
        await fs.mkdir('dist/images', { recursive: true });
        await fs.mkdir('dist/images/posts', { recursive: true });
        
        // Copy static assets
        const staticAssets = [
            ['static/styles.css', 'dist/styles.css'],
            ['static/favicon.ico', 'dist/favicon.ico'],
            ['static/site.webmanifest', 'dist/site.webmanifest'],
            ['static/_redirects', 'dist/_redirects'],
            ['static/android-chrome-192x192.png', 'dist/android-chrome-192x192.png'],
            ['static/android-chrome-512x512.png', 'dist/android-chrome-512x512.png'],
            ['static/apple-touch-icon.png', 'dist/apple-touch-icon.png'],
            ['static/favicon-16x16.png', 'dist/favicon-16x16.png'],
            ['static/favicon-32x32.png', 'dist/favicon-32x32.png']
        ];

        for (const [src, dest] of staticAssets) {
            await fs.copyFile(src, dest).catch(() => {
                console.warn(`Warning: Could not copy ${src}`);
            });
        }
        
        // Copy about page
        await fs.copyFile('templates/jackpearce.html', 'dist/jackpearce.html').catch(() => {
            console.warn('No about.html found in templates directory');
        });
        
        // Process all markdown files
        const postsDir = path.join(__dirname, 'posts');
        const files = await fs.readdir(postsDir);
        const markdownFiles = files.filter(file => path.extname(file) === '.md');
        
        const posts = await Promise.all(
            markdownFiles.map(file => processPost(path.join(postsDir, file)))
        );

        // Generate and minify index page
        const indexHtml = await generateIndex(posts);
        const minifiedIndexHtml = minify(indexHtml, {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            useShortDoctype: true
        });
        await fs.writeFile('dist/index.html', minifiedIndexHtml);

        // Generate RSS feed
        const rssFeed = generateRSS(posts, siteMetadata);
        await fs.writeFile('dist/rss.xml', rssFeed);

        // Generate JSON feed
        const jsonFeed = {
            version: 'https://jsonfeed.org/version/1.1',
            title: siteMetadata.title,
            home_page_url: siteMetadata.siteUrl,
            feed_url: `${siteMetadata.siteUrl}/feed.json`,
            description: siteMetadata.description,
            author: {
                name: siteMetadata.author,
                url: siteMetadata.siteUrl
            },
            items: posts.map(post => ({
                id: post.url,
                url: post.url,
                title: post.title,
                content_html: post.content,
                date_published: post.isoDate,
                date_modified: post.isoModifiedDate,
                authors: [{ name: siteMetadata.author }],
                tags: post.tags || [post.category]
            }))
        };
        await fs.writeFile('dist/feed.json', JSON.stringify(jsonFeed, null, 2));
        
        console.log('Build completed successfully!');
        
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

// Run build
build();