import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { generateSitemap } from './sitemap-generator.js'; // Import sitemap generator

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function createServer() {
  const app = express();
  
  // Compression middleware
  app.use(compression());
  
  let vite;
  if (!isProduction) {
    // In development, use Vite's dev server
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    
    app.use(vite.middlewares);
  } else {
    // In production, serve built files
    app.use(express.static(path.resolve(__dirname, '../dist/client'), {
      index: false
    }));
    
    // Generate sitemap in production
    try {
      await generateSitemap();
      console.log('Sitemap generated successfully!');
    } catch (error) {
      console.error('Error generating sitemap:', error);
    }
    
    // Add route for robots.txt if not already in static files
    if (!fs.existsSync(path.resolve(__dirname, '../dist/client/robots.txt'))) {
      app.get('/robots.txt', (req, res) => {
        res.type('text/plain');
        res.send('User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /history/\n\nSitemap: https://calcq.app/sitemap.xml');
      });
    }
  }
  
  app.use('*', async (req, res) => {
    const url = req.originalUrl;
    
    try {
      let template, render;
      
      if (!isProduction) {
        // Development: Transform index.html on the fly
        template = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render;
      } else {
        // Production: Use built assets
        template = fs.readFileSync(path.resolve(__dirname, '../dist/client/index.html'), 'utf-8');
        render = (await import('../dist/server/entry-server.js')).render;
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
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error(e.stack);
      res.status(500).end(e.stack);
    }
  });
  
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

createServer(); 