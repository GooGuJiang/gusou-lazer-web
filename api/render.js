import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.resolve(__dirname, '../dist/index.html');
const serverEntryPath = path.resolve(__dirname, '../dist/server/entry-server.js');

const resolveRequestUrl = (request) => {
  const host = request.headers.host ?? 'localhost';
  return new URL(request.url ?? '/', `https://${host}`).pathname + new URL(request.url ?? '/', `https://${host}`).search;
};

export default async function handler(request, response) {
  try {
    const [template, serverEntry] = await Promise.all([
      fs.readFile(templatePath, 'utf-8'),
      import(serverEntryPath),
    ]);
    const html = await serverEntry.renderPage(resolveRequestUrl(request), template);

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.status(200).send(html);
  } catch (error) {
    console.error('SSR render failed:', error);
    response.status(500).send('SSR render failed');
  }
}
