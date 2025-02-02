// build.js
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');
const { minify } = require('html-minifier');
const generateRSS = require('./rss'); // Import the RSS generator

// Site metadata for RSS
const siteMetadata = {
    title: "Jack's Tech Blog",
    description: 'Exploring home automation, cloud architecture, and artificial intelligence.',
    siteUrl: 'https://www.jackpearce.co.uk'
};

// Configure marked for syntax highlighting
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

// Validate and generate slug if not provided
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

// Calculate read time
const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

// Process post and generate HTML
async function generatePost(metadata, htmlContent) {
    try {
        const templatePath = path.join(__dirname, 'templates', 'post.html');
        console.log('Loading template from:', templatePath);
        
        const template = await fs.readFile(templatePath, 'utf-8');
        
        // Format the date
        const formattedDate = new Date(metadata.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });

        // Create a regex for each template variable to ensure all instances are replaced
        const replacements = {
            '{{title}}': metadata.title,
            '{{slug}}': metadata.slug,
            '{{date}}': formattedDate,
            '{{category}}': metadata.category,
            '{{readTime}}': metadata.readTime,
            '{{content}}': htmlContent
        };

        // Replace all occurrences of each template variable
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

// Process all posts
async function processPost(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data: metadata, content: markdown } = matter(content);
    
    // Ensure we have a slug
    if (!metadata.slug) {
        metadata.slug = generateSlug(metadata.title);
        console.warn(`No slug provided for ${filePath}, generated: ${metadata.slug}`);
    }

    const htmlContent = marked(markdown);
    const readTime = calculateReadTime(markdown);

    // Generate the complete HTML for the post
    const postHtml = await generatePost({ ...metadata, readTime }, htmlContent);
    
    // Minify the HTML
    const minifiedHtml = minify(postHtml, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
    });

    // Write the post file
    const outputPath = path.join(__dirname, 'dist', 'posts', `${metadata.slug}.html`);
    await fs.writeFile(outputPath, minifiedHtml);

    return {
        ...metadata,
        content: htmlContent,
        readTime,
        slug: metadata.slug
    };
}

// Generate index HTML
async function generateIndex(posts) {
    const template = await fs.readFile(path.join(__dirname, 'templates/index.html'), 'utf-8');
    
    // Get unique categories
    const categories = [...new Set(posts.flatMap(post => 
        (post.category || '').split(',').map(cat => cat.trim())
    ))].filter(Boolean);
    const categoryTags = categories
        .map(category => `
            <button class="category-tag" data-category="${category}">${category}</button>
        `)
        .join('\n');

    // Generate posts HTML
    const postsHtml = posts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(post => {
        // Split categories and trim whitespace
        const postCategories = (post.category || '').split(',').map(cat => cat.trim());
        const primaryCategory = postCategories[0];
        const secondaryCategories = postCategories.slice(1);
        
        // Create a data attribute with all categories
        const allCategories = postCategories.join('|');
        
        // Generate the categories HTML
        const categoriesHtml = `
            <div class="categories-container">
                <div class="category-primary">${primaryCategory}</div>
                ${secondaryCategories.length > 0 ? 
                    `<div class="categories-secondary">${secondaryCategories.join(' · ')}</div>` 
                    : ''}
            </div>
        `;

        return `
            <article class="article-card" data-categories="${allCategories}">
                ${categoriesHtml}
                <h2 class="article-title">
                    <a href="/posts/${post.slug}.html">${post.title}</a>
                </h2>
                <div class="article-meta">
                    ${new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric'
                    })}
                </div>
            </article>
        `;
    })
    .join('\n');
    
    return template
        .replace('{{categories}}', categoryTags)
        .replace('{{posts}}', postsHtml);
}

// Main build function
async function build() {
    try {
        // Create output directories
        await fs.mkdir('dist', { recursive: true });
        await fs.mkdir('dist/posts', { recursive: true });
        
        // Copy static assets
        await fs.copyFile('static/styles.css', 'dist/styles.css').catch(() => {
            console.warn('No styles.css found in static directory');
        });

        // Copy about page
        await fs.copyFile('templates/jackpearce.html', 'dist/jackpearce.html').catch(() => {
            console.warn('No about.html found in templates directory');
        });
        
        // Process all markdown files
        const postsDir = path.join(__dirname, 'posts');
        const files = await fs.readdir(postsDir);
        const markdownFiles = files.filter(file => path.extname(file) === '.md');
        
        // Process all posts
        const posts = await Promise.all(
            markdownFiles.map(file => processPost(path.join(postsDir, file)))
        );

        // Generate index page
        const indexHtml = await generateIndex(posts);
        const minifiedIndexHtml = minify(indexHtml, {
            collapseWhitespace: true,
            removeComments: true
        });
        await fs.writeFile('dist/index.html', minifiedIndexHtml);

        // Generate RSS feed using the imported function
        const rssFeed = generateRSS(posts, siteMetadata);
        await fs.writeFile('dist/rss.xml', rssFeed);
        
        console.log('Build completed successfully!');
        
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

// Run build
build();