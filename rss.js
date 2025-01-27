// rss.js
const escapeXml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe.toString().replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
};

const generateRSS = (posts, siteMetadata) => {
    const items = posts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(post => {
            // Ensure all required fields exist
            const title = post.title || '';
            const slug = post.slug || '';
            const excerpt = post.excerpt || '';
            const category = post.category || '';
            const date = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString();

            return `
            <item>
                <title>${escapeXml(title)}</title>
                <link>${escapeXml(siteMetadata.siteUrl)}/posts/${escapeXml(slug)}.html</link>
                <description>${escapeXml(excerpt)}</description>
                <category>${escapeXml(category)}</category>
                <pubDate>${date}</pubDate>
                <guid>${escapeXml(siteMetadata.siteUrl)}/posts/${escapeXml(slug)}.html</guid>
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