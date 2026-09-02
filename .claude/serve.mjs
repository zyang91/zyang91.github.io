import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT) || 8931;
const types = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.ico': 'image/x-icon',
};

createServer(async (req, res) => {
	try {
		let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
		if (path.endsWith('/')) path += 'index.html';
		const file = normalize(join(root, path));
		if (!file.startsWith(root)) throw new Error('forbidden');
		const data = await readFile(file);
		res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
		res.end(data);
	} catch {
		res.writeHead(404);
		res.end('not found');
	}
}).listen(port, () => console.log(`serving on http://localhost:${port}`));
