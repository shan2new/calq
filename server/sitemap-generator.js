import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// This is a simplified version since we don't have direct access to unit data
// In a real implementation, you would import unit data from your actual data source
export async function generateSitemap() {
  const baseUrl = 'https://calcq.app';
  const outputDir = path.resolve(__dirname, '../dist/client');
  
  // Ensure the directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate all sitemap types
  await Promise.all([
    generateMainSitemap(outputDir, baseUrl),
    generateCategorySitemap(outputDir, baseUrl),
    generateConversionSitemap(outputDir, baseUrl),
    generateImageSitemap(outputDir, baseUrl),
    generateBlogSitemap(outputDir, baseUrl),
    generateSitemapIndex(outputDir, baseUrl)
  ]);
  
  console.log('All sitemaps generated successfully');
}

// Main sitemap with static routes
async function generateMainSitemap(outputDir, baseUrl) {
  // Basic static routes
  const urls = [
    baseUrl,
    `${baseUrl}/explore`,
    `${baseUrl}/settings`,
  ];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.resolve(outputDir, 'sitemap-main.xml'), sitemap);
  console.log('Main sitemap generated successfully');
}

// Category-specific sitemap
async function generateCategorySitemap(outputDir, baseUrl) {
  // Sample categories - in production, get these from your actual data
  const sampleCategories = [
    'length', 'mass', 'volume', 'temperature', 
    'time', 'speed', 'area', 'data', 'energy'
  ];
  
  // Add category pages
  const urls = sampleCategories.map(category => 
    `${baseUrl}/convert/${category}`
  );
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.resolve(outputDir, 'sitemap-categories.xml'), sitemap);
  console.log('Category sitemap generated successfully');
}

// Conversion-specific sitemap
async function generateConversionSitemap(outputDir, baseUrl) {
  // Sample categories - in production, get these from your actual data
  const sampleCategories = [
    'length', 'mass', 'volume', 'temperature', 
    'time', 'speed', 'area', 'data', 'energy'
  ];
  
  let urls = [];
  
  // Add some common conversions for each category
  for (const category of sampleCategories) {
    const commonConversions = getCommonConversionsForCategory(category);
    urls.push(...commonConversions.map(conversion => 
      `${baseUrl}/convert/${category}/${conversion.from}/${conversion.to}`
    ));
  }
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.resolve(outputDir, 'sitemap-conversions.xml'), sitemap);
  console.log('Conversions sitemap generated successfully');
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

// Generate image sitemap
async function generateImageSitemap(outputDir, baseUrl) {
  // Create image sitemap with calculator screenshots for popular conversions
  const imageUrls = [
    { url: `${baseUrl}/convert/length/meter/foot`, image: '/images/conversions/meter-to-foot.webp' },
    { url: `${baseUrl}/convert/temperature/celsius/fahrenheit`, image: '/images/conversions/celsius-to-fahrenheit.webp' },
    { url: `${baseUrl}/convert/mass/kilogram/pound`, image: '/images/conversions/kilogram-to-pound.webp' },
    { url: `${baseUrl}/convert/volume/liter/gallon`, image: '/images/conversions/liter-to-gallon.webp' }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageUrls.map(item => `  <url>
    <loc>${item.url}</loc>
    <image:image>
      <image:loc>${baseUrl}${item.image}</image:loc>
      <image:title>${item.url.split('/').slice(-2).join(' to ')} conversion</image:title>
      <image:caption>Calculator showing conversion from ${item.url.split('/').slice(-2).join(' to ')}</image:caption>
    </image:image>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.resolve(outputDir, 'sitemap-images.xml'), sitemap);
  console.log('Image sitemap generated successfully');
}

// Generate blog sitemap
async function generateBlogSitemap(outputDir, baseUrl) {
  // Get blog post data - in a real implementation, this would come from a database or API
  const blogPosts = [
    {
      slug: 'why-metric-system-worldwide',
      lastmod: '2023-01-20',
      changefreq: 'monthly',
      priority: '0.8'
    },
    {
      slug: 'common-conversion-mistakes',
      lastmod: '2023-02-15',
      changefreq: 'monthly',
      priority: '0.8'
    },
    {
      slug: 'recipe-measurements-abroad',
      lastmod: '2023-03-05',
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      slug: 'unit-conversion-history',
      lastmod: '2023-04-18',
      changefreq: 'monthly',
      priority: '0.7'
    }
  ];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogPosts.map(post => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <changefreq>${post.changefreq}</changefreq>
    <priority>${post.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.resolve(outputDir, 'sitemap-blog.xml'), sitemap);
  console.log('Blog sitemap generated successfully');
}

// Generate sitemap index file
async function generateSitemapIndex(outputDir, baseUrl) {
  const sitemaps = [
    {
      name: 'sitemap-main.xml',
      lastmod: new Date().toISOString().split('T')[0],
      priority: 1.0
    },
    {
      name: 'sitemap-categories.xml',
      lastmod: new Date().toISOString().split('T')[0],
      priority: 0.8
    },
    {
      name: 'sitemap-conversions.xml',
      lastmod: new Date().toISOString().split('T')[0],
      priority: 0.6
    },
    {
      name: 'sitemap-blog.xml',
      lastmod: new Date().toISOString().split('T')[0],
      priority: 0.7
    },
    {
      name: 'sitemap-images.xml',
      lastmod: new Date().toISOString().split('T')[0],
      priority: 0.5
    }
  ];

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${baseUrl}/${sitemap.name}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  fs.writeFileSync(path.resolve(outputDir, 'sitemap.xml'), sitemapIndex);
  console.log('Sitemap index generated successfully');
} 