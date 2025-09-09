/**
 * Cloudflare Worker for serving Jack Pearce's blog
 * Handles static assets with custom redirects and caching
 * Uses the new Workers static assets API
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const query = url.search;

    // Handle .html extension removal and trailing slash redirects
    if (path.endsWith('.html')) {
      // Remove .html and add trailing slash if not root
      const canonicalPath = path === '/index.html' 
        ? '/' 
        : path.slice(0, -5) + '/';
      return Response.redirect(canonicalPath + query, 301);
    }

    // Add trailing slash for directory-style paths (no extension and not ending with /)
    // Skip if it's a file with an extension
    if (!path.endsWith('/') && !path.includes('.') && path !== '/') {
      return Response.redirect(path + '/' + query, 301);
    }

    // Let the static assets system handle everything else
    // The wrangler.jsonc configuration handles:
    // - auto-trailing-slash for HTML files  
    // - single-page-application fallback to index.html
    // - _headers and _redirects file processing
    
    // This allows the built-in static assets handling to work with our configuration
    return env.ASSETS.fetch(request);
  }
};