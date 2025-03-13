// build.js
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');
const generateRSS = require('./rss'); // Import the RSS generator

// Site metadata for RSS
const siteMetadata = {
    title: "Jack's Tech Blog",
    description: 'Exploring home automation, cloud architecture, and artificial intelligence.',
    siteUrl: 'https://www.jackpearce.co.uk'
};

// Configure marked for syntax highlighting
const Prism = require('prismjs');
require('prismjs/components/prism-javascript');
require('prismjs/components/prism-typescript');
require('prismjs/components/prism-jsx');
require('prismjs/components/prism-tsx');
require('prismjs/components/prism-yaml');
require('prismjs/components/prism-json');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-python');
require('prismjs/components/prism-go');
require('prismjs/components/prism-rust');
require('prismjs/components/prism-css');
require('prismjs/components/prism-markdown');

marked.setOptions({
    highlight: (code, lang) => {
        if (lang && Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
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

// In build.js, update the generatePost function:

async function generatePost(metadata, htmlContent) {
    try {
        const templatePath = path.join(__dirname, 'templates', 'post.html');
        const template = await fs.readFile(templatePath, 'utf-8');
        
        // Format the date
        const formattedDate = new Date(metadata.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });

        // Process categories
        const categories = metadata.category.split(',').map(cat => cat.trim());
        const primaryCategory = categories[0];
        const secondaryCategories = categories.slice(1);
        
        // Generate categories HTML
        const categoriesHtml = `
            <div class="categories-container">
                <span class="category-primary">${primaryCategory}</span>
                ${secondaryCategories.length > 0 ? 
                    `<span class="categories-secondary">${secondaryCategories.join(' · ')}</span>` 
                    : ''}
            </div>
        `;

        // Generate canonical URL - add trailing slash
        const canonicalUrl = `${siteMetadata.siteUrl}/posts/${metadata.slug}/`;

        // Determine if we should show giscus comments based on post date
        const postDate = new Date(metadata.date);
        const cutoffDate = new Date('2015-01-01');
        const showGiscus = postDate >= cutoffDate;

        // Generate comments section HTML
        const commentsHtml = showGiscus ? `
        <section class="comments">
            <script src="https://giscus.app/client.js"
                data-repo="jkpe/www.jackpearce.co.uk"
                data-repo-id="R_kgDONwZpHA"
                data-category="Comments"
                data-category-id="DIC_kwDONwZpHM4Cn-OX"
                data-mapping="title"
                data-strict="0"
                data-reactions-enabled="1"
                data-emit-metadata="0"
                data-input-position="bottom"
                data-theme="preferred_color_scheme"
                data-lang="en"
                crossorigin="anonymous"
                async>
            </script>
        </section>` : '';

        // Replace template variables
        const replacements = {
            '{{title}}': metadata.title,
            '{{slug}}': metadata.slug,
            '{{date}}': formattedDate,
            '{{category}}': categoriesHtml,
            '{{readTime}}': metadata.readTime,
            '{{content}}': htmlContent,
            '<meta rel="canonical" href="https://www.jackpearce.co.uk">': 
                `<meta rel="canonical" href="${canonicalUrl}">`,
            '<section class="comments">': commentsHtml ? commentsHtml : '<!-- giscus comments disabled for older posts -->',
            '</section>': commentsHtml ? '</section>' : ''
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
    
    // Write the post file without minification
    const outputPath = path.join(__dirname, 'dist', 'posts', `${metadata.slug}.html`);
    await fs.writeFile(outputPath, postHtml);

    return {
        ...metadata,
        content: htmlContent,
        readTime,
        slug: metadata.slug
    };
}

// Function to generate talks page
async function generateTalksPage(talks) {
    try {
        const templatePath = path.join(__dirname, 'templates', 'talks.html');
        const template = await fs.readFile(templatePath, 'utf-8');
        
        // Get unique topics for filters
        const topics = [...new Set(talks.map(talk => talk.topic))].filter(Boolean);
        
        // Generate filter buttons HTML
        const filtersHtml = topics.map(topic => 
            `<button class="filter-option" data-filter="${topic}">${topic}</button>`
        ).join('\n');
        
        // Generate talks HTML
        const talksHtml = talks
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(talk => {
                // Format date
                const talkDate = new Date(talk.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                // Default thumbnail if not provided
                const thumbnail = talk.thumbnail || '/images/talk-default.jpg';
                
                // Generate links HTML
                const linksHtml = [];
                
                if (talk.slidesUrl) {
                    linksHtml.push(`
                        <a href="${talk.slidesUrl}" target="_blank" rel="noopener noreferrer" class="talk-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                <polyline points="13 2 13 9 20 9"></polyline>
                            </svg>
                            Slides
                        </a>
                    `);
                }
                
                if (talk.videoUrl) {
                    linksHtml.push(`
                        <a href="${talk.videoUrl}" target="_blank" rel="noopener noreferrer" class="talk-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                            </svg>
                            Watch
                        </a>
                    `);
                }
                
                if (talk.codeUrl) {
                    linksHtml.push(`
                        <a href="${talk.codeUrl}" target="_blank" rel="noopener noreferrer" class="talk-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="16 18 22 12 16 6"></polyline>
                                <polyline points="8 6 2 12 8 18"></polyline>
                            </svg>
                            Code
                        </a>
                    `);
                }
                
                return `
                    <article class="talk-card" data-topic="${talk.topic || ''}">
                        <img src="${thumbnail}" alt="${talk.title}" class="talk-thumbnail">
                        <div class="talk-content">
                            <h2 class="talk-title">${talk.title}</h2>
                            <div class="talk-meta">
                                <span class="talk-date">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    ${talkDate}
                                </span>
                                ${talk.event ? `
                                <span class="talk-event">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                    ${talk.event}
                                </span>
                                ` : ''}
                            </div>
                            <p class="talk-description">${talk.description || ''}</p>
                            <div class="talk-links">
                                ${linksHtml.join('\n')}
                            </div>
                        </div>
                    </article>
                `;
            }).join('\n');
        
        // Replace template variables
        let result = template;
        result = result.replace('{{filters}}', filtersHtml);
        result = result.replace('{{talks}}', talksHtml);
        
        // Write the talks page without minification
        const outputPath = path.join(__dirname, 'dist', 'talks.html');
        await fs.writeFile(outputPath, result);
        
        console.log('Talks page generated successfully!');
        
    } catch (error) {
        console.error('Error generating talks page:', error);
        throw error;
    }
}

async function loadTalksData() {
    try {
        const talksPath = path.join(__dirname, 'talks', 'talks.json');
        const talksData = await fs.readFile(talksPath, 'utf-8');
        return JSON.parse(talksData);
    } catch (error) {
        console.warn('No talks data found, creating empty talks page');
        return [];
    }
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
        const postCategories = (post.category || '').split(',').map(cat => cat.trim());
        const primaryCategory = postCategories[0];
        const secondaryCategories = postCategories.slice(1);
        const allCategories = postCategories.join('|');
        
        return `
            <article class="article-card" data-categories="${allCategories}">
                <div class="article-header">
                    <div class="article-header-main">
                        <div class="categories-container">
                            <div class="category-primary">${primaryCategory}</div>
                            ${secondaryCategories.length > 0 ? 
                                `<div class="categories-secondary">· ${secondaryCategories.join(' · ')}</div>` 
                                : ''}
                        </div>
                    </div>
                    <div class="article-meta">
                        ${new Date(post.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric'
                        })}
                    </div>
                </div>
                <h2 class="article-title">
                    <a href="/posts/${post.slug}/">${post.title}</a>
                </h2>
                ${post.excerpt ? `<div class="article-excerpt">${post.excerpt}</div>` : ''}
            </article>
        `;
    })
    .join('\n');
    
    return template
        .replace('{{categories}}', categoryTags)
        .replace('{{posts}}', postsHtml);
}

// Function to generate projects page (updated for table layout)
async function generateProjectsPage(projects) {
    try {
        const templatePath = path.join(__dirname, 'templates', 'projects.html');
        const template = await fs.readFile(templatePath, 'utf-8');
        
        // Generate projects HTML for table layout
        const projectsHtml = projects.map(project => {
            // Generate links HTML
            const linksHtml = [];
            
            if (project.url) {
                linksHtml.push(`
                    <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        View
                    </a>
                `);
            }
            
            if (project.github) {
                linksHtml.push(`
                    <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                        Code
                    </a>
                `);
            }
            
            return `
                <tr>
                    <td class="project-title-cell" data-label="Project">${project.title}</td>
                    <td class="project-description-cell" data-label="Description">${project.description || ''}</td>
                    <td class="project-links-cell" data-label="Links">
                        ${linksHtml.join('\n')}
                    </td>
                </tr>
            `;
        }).join('\n');
        
        // Replace template variables
        let result = template;
        result = result.replace('{{projects}}', projectsHtml);
        
        // Write the projects page without minification
        const outputPath = path.join(__dirname, 'dist', 'projects.html');
        await fs.writeFile(outputPath, result);
        
        console.log('Projects page generated successfully!');
        
    } catch (error) {
        console.error('Error generating projects page:', error);
        throw error;
    }
}

async function loadProjectsData() {
    try {
        const projectsPath = path.join(__dirname, 'projects', 'projects.json');
        const projectsData = await fs.readFile(projectsPath, 'utf-8');
        return JSON.parse(projectsData);
    } catch (error) {
        console.warn('No projects data found, creating empty projects page');
        return [];
    }
}

// Main build function
async function build() {
    try {
        // Create output directories
        await fs.mkdir('dist', { recursive: true });
        await fs.mkdir('dist/posts', { recursive: true });
        
        // Create images directory for talks thumbnails
        await fs.mkdir('dist/images', { recursive: true }).catch(() => {});
        await fs.mkdir('dist/images/talks', { recursive: true }).catch(() => {});
        
        // Create images directory for project thumbnails
        await fs.mkdir('dist/images/projects', { recursive: true }).catch(() => {});
        
        // Copy static assets
        await fs.copyFile('static/styles.css', 'dist/styles.css').catch(() => {
            console.warn('No styles.css found in static directory');
        });
        
        // Copy profile photo if it exists
        await fs.copyFile('static/profile.jpg', 'dist/profile.jpg').catch(() => {
            console.warn('No profile.jpg found in static directory');
        });

        // Copy talk thumbnails if they exist
        try {
            const talksImagesDir = path.join(__dirname, 'static', 'images', 'talks');
            const imageFiles = await fs.readdir(talksImagesDir).catch(() => []);
            
            for (const file of imageFiles) {
                await fs.copyFile(
                    path.join(talksImagesDir, file), 
                    path.join(__dirname, 'dist', 'images', 'talks', file)
                ).catch(() => {});
            }
        } catch (error) {
            console.warn('Error copying talk images:', error.message);
        }

        // Copy project thumbnails if they exist
        try {
            const projectsImagesDir = path.join(__dirname, 'static', 'images', 'projects');
            const imageFiles = await fs.readdir(projectsImagesDir).catch(() => []);
            
            for (const file of imageFiles) {
                await fs.copyFile(
                    path.join(projectsImagesDir, file), 
                    path.join(__dirname, 'dist', 'images', 'projects', file)
                ).catch(() => {});
            }
        } catch (error) {
            console.warn('Error copying project images:', error.message);
        }

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

        // Generate index page without minification
        const indexHtml = await generateIndex(posts);
        await fs.writeFile('dist/index.html', indexHtml);

        // Generate RSS feed using the imported function
        const rssFeed = generateRSS(posts, siteMetadata);
        await fs.writeFile('dist/rss.xml', rssFeed);
        await fs.writeFile('dist/index.xml', rssFeed);
        
        // Generate talks page
        try {
            const talks = await loadTalksData();
            await generateTalksPage(talks);
        } catch (error) {
            console.warn('Error generating talks page:', error.message);
        }
        
        // Generate projects page
        try {
            const projects = await loadProjectsData();
            await generateProjectsPage(projects);
        } catch (error) {
            console.warn('Error generating projects page:', error.message);
        }
        
        console.log('Build completed successfully!');
        
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

// Run build
build();