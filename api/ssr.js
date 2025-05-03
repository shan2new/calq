import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import compression from 'compression';

// For Vercel serverless environment
const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';

// Configure paths based on environment
let __dirname;
try {
  __dirname = path.dirname(fileURLToPath(import.meta.url));
} catch (e) {
  // Fallback for environments where import.meta.url is not available
  __dirname = process.cwd();
}

// Adjust path resolution based on environment
const resolve = (p) => {
  if (isVercel) {
    // In Vercel, the structure is flattened in production
    return path.join(process.cwd(), p);
  }
  return path.resolve(__dirname, p);
};

// Create express app
const app = express();
app.use(compression());

// Initialize server
async function init() {
  let vite;
  
  if (!isProduction) {
    // In development, use Vite's dev server
    const { createServer } = await import('vite');
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files
    app.use(express.static(resolve('./dist/client')));
  }
  
  // For all routes, render the app
  app.use('*', async (req, res) => {
    const url = req.originalUrl;
    
    try {
      let template, render;
      
      if (!isProduction) {
        // Development: Transform index.html on the fly
        template = fs.readFileSync(resolve('./index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
      } else {
        // Production: Use built assets
        template = fs.readFileSync(resolve('./dist/client/index.html'), 'utf-8');
        // Dynamic import for production
        const serverEntry = await import('../dist/server/entry-server.js');
        render = serverEntry.render;
      }
      
      // Render the app
      const { appHtml, appState, helmetContext } = await render(url);
      
      // Get helmet data for SEO
      const { helmet } = helmetContext;
      
      // Inject the rendered app into the template
      const html = template
        .replace('<!--app-html-->', appHtml)
        .replace('<!--head-tags-->', 
          `${helmet.title.toString()}
           ${helmet.meta.toString()}
           ${helmet.link.toString()}
           ${helmet.script.toString()}`
        )
        .replace(
          '<!--initial-state-->', 
          `<script>window.__INITIAL_STATE__ = ${JSON.stringify(appState)}</script>`
        );
      
      // Set content type and send
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      // Handle errors
      console.error('Error rendering:', e.stack);
      res.status(500).send(`Server Error: ${isProduction ? 'See logs for details' : e.stack}`);
    }
  });
  
  return app;
}

// Initialize app before exporting
let serverPromise = init();

// Export a serverless function for Vercel
export default async function handler(req, res) {
  const server = await serverPromise;
  server(req, res);
} 