import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// This is a simplified version since we don't have direct access to unit data
// In a real implementation, you would import unit data from your actual data source
export async function generateSitemap() {
  const baseUrl = 'https://calcq.app';
  
  // Basic static routes
  let urls = [
    baseUrl,
    `${baseUrl}/explore`,
    `${baseUrl}/settings`,
  ];
  
  // Sample categories - in production, get these from your actual data
  const sampleCategories = [
    'length', 'mass', 'volume', 'temperature', 
    'time', 'speed', 'area', 'data', 'energy'
  ];
  
  // Add category pages
  for (const category of sampleCategories) {
    urls.push(`${baseUrl}/convert/${category}`);
    
    // Add some common conversions for each category (samples only)
    const commonConversions = getCommonConversionsForCategory(category);
    urls.push(...commonConversions.map(conversion => 
      `${baseUrl}/convert/${category}/${conversion.from}/${conversion.to}`));
  }
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  // Ensure the directory exists
  const outputDir = path.resolve(__dirname, '../dist/client');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(path.resolve(outputDir, 'sitemap.xml'), sitemap);
  console.log('Sitemap generated successfully');
}

// Helper function to get common conversions for each category
function getCommonConversionsForCategory(category) {
  const commonConversions = {
    'length': [
      { from: 'meter', to: 'foot' },
      { from: 'kilometer', to: 'mile' },
      { from: 'centimeter', to: 'inch' },
    ],
    'mass': [
      { from: 'kilogram', to: 'pound' },
      { from: 'gram', to: 'ounce' },
    ],
    'temperature': [
      { from: 'celsius', to: 'fahrenheit' },
      { from: 'kelvin', to: 'celsius' },
    ],
    // Add more category conversions as needed
  };
  
  return commonConversions[category] || [];
} 