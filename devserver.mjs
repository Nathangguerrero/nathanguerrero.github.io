import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3456;
const RELOAD_SCRIPT = `
<script>
(function(){
  var es = new EventSource('/__reload');
  es.onmessage = function(){ location.reload(); };
})();
</script>`;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

let clients = [];
const mtimes = new Map();
let debounceTimer = null;
const WATCH_EXT = new Set(['.html', '.css', '.js', '.json', '.svg']);

fs.watch(ROOT, { recursive: true }, (_, filename) => {
  if (!filename) return;
  if (filename.includes('devserver') || filename.includes('.git') || filename.includes('.tmp')) return;
  const ext = path.extname(filename);
  if (!WATCH_EXT.has(ext)) return;
  const fullPath = path.join(ROOT, filename);
  try {
    const mtime = fs.statSync(fullPath).mtimeMs;
    if (mtimes.get(fullPath) === mtime) return;
    mtimes.set(fullPath, mtime);
  } catch { return; }
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log('reload:', filename);
    clients.forEach(res => res.write('data: reload\n\n'));
  }, 300);
});

http.createServer((req, res) => {
  // SSE endpoint
  if (req.url === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(': connected\n\n');
    clients.push(res);
    req.on('close', () => { clients = clients.filter(c => c !== res); });
    return;
  }

  let filePath = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));

  // directory → index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404); res.end('Not found'); return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  const isHtml = ext === '.html';

  // Range support for video
  const stat = fs.statSync(filePath);
  if (req.headers.range && !isHtml) {
    const range = req.headers.range;
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': mime,
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, { 'Content-Type': mime });
  if (isHtml) {
    let html = fs.readFileSync(filePath, 'utf8');
    html = html.replace('</body>', RELOAD_SCRIPT + '</body>');
    res.end(html);
  } else {
    fs.createReadStream(filePath).pipe(res);
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
