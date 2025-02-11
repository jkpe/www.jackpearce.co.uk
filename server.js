const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Redirect URLs without trailing slash to URLs with trailing slash
app.get('*', (req, res, next) => {
  const url = req.path;
  // Skip if URL already has trailing slash or has a file extension
  if (url.endsWith('/') || path.extname(url) !== '') {
    return next();
  }
  // Redirect to URL with trailing slash
  res.redirect(301, req.path + '/' + req.url.slice(req.path.length));
});

// Handle HTML files without extension
app.get('*', (req, res, next) => {
  let url = req.path;
  
  // Skip if the url has an extension
  if (path.extname(url) !== '') {
    return next();
  }
  
  // Remove the trailing slash for file lookup
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
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
