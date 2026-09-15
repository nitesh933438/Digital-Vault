const fs = require('fs');
const path = require('path');

const dist = path.resolve('dist');
const indexPath = path.join(dist, 'index.html');
const notFoundPath = path.join(dist, '404.html');

const indexHtml = fs.readFileSync(indexPath, 'utf8');

const redirect404 = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex">
  <title>Digital Vault</title>
  <script>
    (function () {
      var base = '/Digital-Vault/';
      var path = window.location.pathname;
      if (path.indexOf(base) === 0) path = path.slice(base.length);
      var query = window.location.search || '';
      var target = base + '#/' + path.replace(/^\\/+/, '') + query;
      window.location.replace(target);
    })();
  </script>
</head>
<body>
  <p>Redirecting to Digital Vault…</p>
</body>
</html>`;

fs.writeFileSync(notFoundPath, redirect404);
fs.writeFileSync(path.join(dist, '404-source.html'), indexHtml);
console.log('GitHub Pages SPA fallback created:', notFoundPath);
