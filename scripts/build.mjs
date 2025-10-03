#!/usr/bin/env node
/**
 * Esbuild build script for React + TypeScript app
 * - Bundles src/main.tsx into dist/assets/app.js
 * - Rewrites index.html references to point at built bundle
 * - Copies shadcn.css for Tailwind/shadcn UI styles
 * - Production mode via --production flag or NODE_ENV=production
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.argv.includes('--production') || process.env.NODE_ENV === 'production';
const outDir = path.resolve(__dirname, '..', 'dist');
const srcDir = path.resolve(__dirname, '..', 'src');

/**
 * Ensure directory exists
 */
async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

/**
 * Copy a file, creating directories as needed
 */
async function copyFileSafe(src, dest) {
  try {
    await ensureDir(path.dirname(dest));
    await fs.promises.copyFile(src, dest);
  } catch {
    // ignore if source doesn't exist
  }
}

/**
 * Rewrites index.html to point scripts/styles at built files
 */
function rewriteIndexHtml(html) {
  let out = html;

  // Rewrite main.tsx to built app.js
  out = out.replace(/src\s*=\s*["'](?:\.\/)?(?:src\/)?main\.tsx["']/g, 'src="/assets/app.js"');

  // Ensure shadcn.css points to /shadcn.css in dist
  out = out.replace(/href\s*=\s*["'](?:\.\/)?(?:src\/)?shadcn\.css["']/g, 'href="/shadcn.css"');

  return out;
}

/**
 * Write dist/index.html, rewriting if necessary.
 */
async function writeIndex() {
  const projectIndex = path.resolve(__dirname, '..', 'index.html');

  let html;
  try {
    html = await fs.promises.readFile(projectIndex, 'utf8');
  } catch {
    // Fallback minimal index if project index doesn't exist
    html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>TUG Lobbies</title>
    <link rel="stylesheet" href="/shadcn.css" />
  </head>
  <body class="bg-slate-900">
    <div id="root"></div>
    <script type="module" src="/assets/app.js"></script>
  </body>
</html>`;
  }

  const rewritten = rewriteIndexHtml(html);
  await ensureDir(outDir);
  await fs.promises.writeFile(path.join(outDir, 'index.html'), rewritten, 'utf8');
}

/**
 * Copy shadcn.css to dist
 */
async function copyStyles() {
  const candidates = [
    path.resolve(srcDir, 'shadcn.css'),
    path.resolve(__dirname, '..', 'shadcn.css')
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      await copyFileSafe(c, path.join(outDir, 'shadcn.css'));
      break;
    }
  }
}

/**
 * Build with esbuild
 */
async function build() {
  await writeIndex();
  await copyStyles();

  const ctx = await esbuild.context({
    entryPoints: [path.resolve(srcDir, 'main.tsx')],
    bundle: true,
    outdir: path.join(outDir, 'assets'),
    entryNames: 'app',
    platform: 'browser',
    format: 'esm',
    target: 'es2020',
    sourcemap: isProd ? false : 'inline',
    minify: isProd,
    jsx: 'automatic',
    loader: {
      '.svg': 'file',
      '.png': 'file',
      '.jpg': 'file',
      '.jpeg': 'file',
      '.gif': 'file',
      '.webp': 'file',
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
    }
  });

  if (isProd) {
    await ctx.rebuild();
    await ctx.dispose();
    console.log('✅ Production build completed.');
  } else {
    await ctx.watch();
    console.log('🚀 Dev build watching. Serve ./dist with your preferred static server or use Vite for dev.');
  }
}

build().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});