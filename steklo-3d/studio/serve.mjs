import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(process.argv[2] || '.'); const port = +process.argv[3] || 8765;
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.mjs':'text/javascript', '.png':'image/png', '.webp':'image/webp', '.jpg':'image/jpeg', '.json':'application/json', '.css':'text/css' };
http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]); let f = path.join(root, u); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
}).listen(port, () => console.log('serving', root, port));
