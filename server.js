const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle HTML files without extension
app.get('*', (req, res, next) => {
  // Remove trailing slash except for root path
  let url = req.path;
  if (url.length > 1 && url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  // Skip if the url already has an extension
  if (path.extname(url) !== '') {
    return next();
  }
  
  // Try to serve the HTML file
  const filePath = path.join(__dirname, 'dist', `${url}.html`);
  res.sendFile(filePath, (err) => {
    if (err) {
      // If HTML file doesn't exist, fall through to index.html
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});