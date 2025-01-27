// rss.js
const escapeXml = (unsafe) => {
    if (!unsafe) return '';
    
    // First pass: escape all raw ampersands that aren't already part of an entity
    const preProcessed = unsafe.toString().replace(/&(?![a-zA-Z0-9#]+;)/g, '&amp;');
    
    // Second pass: escape other special characters
    return preProcessed
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

const generateRSS = (posts, siteMetadata) => {
    const items = posts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(post => {
            // Ensure all required fields exist and are escaped
            const title = escapeXml(post.title || '');
            const slug = escapeXml(post.slug || '');
            const excerpt = escapeXml(post.excerpt || '');
            const category = escapeXml(post.category || '');
            const date = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString();
            const siteUrl = escapeXml(siteMetadata.siteUrl);

            return `
            <item>
                <title>${title}</title>
                <link>${siteUrl}/posts/${slug}.html</link>
                <description>${excerpt}</description>
                <category>${category}</category>
                <pubDate>${date}</pubDate>
                <guid>${siteUrl}/posts/${slug}.html</guid>
            </item>
        `}).join('\n');

    const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${escapeXml(siteMetadata.title)}</title>
        <link>${escapeXml(siteMetadata.siteUrl)}</link>
        <description>${escapeXml(siteMetadata.description)}</description>
        <language>en-us</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${escapeXml(siteMetadata.siteUrl)}/rss.xml" rel="self" type="application/rss+xml"/>
        ${items}
    </channel>
</rss>`;

    return feed;
};

module.exports = generateRSS;