import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createHttpServer } from 'node:http';

import { createServer } from 'vite';

const port = Number(process.env.PORT ?? 5173);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const vite = await createServer({
  server: {
    middlewareMode: true,
  },
  appType: 'custom',
});

const templatePath = path.resolve(__dirname, 'index.html');
const fallbackTemplate = await fs.readFile(templatePath, 'utf-8');
const htmlEntities = {
  '&': '\u0026amp;',
  '<': '\u0026lt;',
  '>': '\u0026gt;',
  '"': '\u0026quot;',
  "'": '\u0026#39;',
};

const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => htmlEntities[char] ?? char);

const server = createHttpServer(async (request, response) => {
  try {
    const requestUrl = request.url ?? '/';
    const template = await vite.transformIndexHtml(requestUrl, fallbackTemplate);
    const { renderPage } = await vite.ssrLoadModule('/src/entry-server.tsx');
    const html = await renderPage(requestUrl, template, request.headers.authorization);

    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(html);
  } catch (error) {
    vite.ssrFixStacktrace(error);
    response.writeHead(500, { 'Content-Type': 'text/html' });
    response.end(
      `<pre>${escapeHtml(error instanceof Error ? error.stack || error.message : String(error))}</pre>`
    );
  }
});

server.listen(port, () => {
  console.log(`SSR dev server running at http://localhost:${port}`);
});
