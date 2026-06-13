import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.resolve(__dirname, '../dist/index.html');
const serverEntryRelPath = './dist/server/entry-server.js';

const resolveRequestUrl = (request) => {
  const host = request.headers.host ?? 'localhost';
  const parsedUrl = new URL(request.url ?? '/', `https://${host}`);
  return parsedUrl.pathname + parsedUrl.search;
};

const getErrorDetail = (error) => {
  if (error instanceof Error) return `${error.message}\n${error.stack ?? ''}`;
  return String(error);
};

/**
 * 检查模板文件是否存在，用于判断 SSR bundle 是否已构建
 */
let serverEntryExists = true;
try {
  await fs.access(path.resolve(__dirname, serverEntryRelPath));
} catch {
  serverEntryExists = false;
  console.warn('[SSR] entry-server.js not found - falling back to SPA mode');
}

export default async function handler(request, response) {
  // 如果没有 SSR bundle（如 Vercel 仅构建了客户端包），直接返回 SPA HTML
  if (!serverEntryExists) {
    try {
      const template = await fs.readFile(templatePath, 'utf-8');
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.status(200).send(template);
    } catch (error) {
      console.error('[SSR] SPA fallback failed:', getErrorDetail(error));
      response.status(500).send('SSR render failed');
    }
    return;
  }

  try {
    const [template, serverEntry] = await Promise.all([
      fs.readFile(templatePath, 'utf-8'),
      import(serverEntryRelPath),
    ]);
    const html = await serverEntry.renderPage(
      resolveRequestUrl(request),
      template,
      request.headers.authorization
    );

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.status(200).send(html);
  } catch (error) {
    console.error('[SSR] render failed:', getErrorDetail(error));

    // Fallback: 返回 SPA 模式的 index.html
    try {
      const template = await fs.readFile(templatePath, 'utf-8');
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.status(200).send(template);
    } catch {
      response.status(500).send('SSR render failed');
    }
  }
}
