# Jack Pearce's Blog - Developer Guidelines

## Build Commands
- Build site: `npm run build` - Generates static site in dist/
- Start local server: `npm run start` - Starts Express server on port 3000
- View site locally: http://localhost:3000

## Code Style Guidelines
- Indentation: 4 spaces
- Quotes: Single quotes for JS strings
- Function style: Use async/await for asynchronous operations
- Error handling: Use try/catch blocks with specific error messages
- File naming: Kebab-case for markdown files (e.g., `my-post-title.md`)
- HTML templates: Use double curly braces for variables `{{variable}}`

## Markdown Post Format
- Required frontmatter: title, date, category, slug
- Categories: Comma-separated list, first category is primary
- Dates: ISO format (YYYY-MM-DD)
- Code blocks: Use language identifiers for syntax highlighting

## Directory Structure
- `/posts/`: Markdown content files
- `/templates/`: HTML templates for pages
- `/static/`: Static assets (CSS, images)
- `/dist/`: Build output (generated)