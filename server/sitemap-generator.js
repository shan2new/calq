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
    generateNewsSitemap(outputDir, baseUrl),
    generateVideoSitemap(outputDir, baseUrl),
    generateMobileSitemap(outputDir, baseUrl),
    generateHreflangSitemap(outputDir, baseUrl),
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
    'time', 'speed', 'area', 'data', 'energy',
    'pressure', 'angle', 'force', 'power', 'fuel',
    'current', 'voltage', 'frequency', 'acceleration',
    'digital-storage', 'typography', 'luminance'
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
      { from: 'meter', to: 'yard' },
      { from: 'millimeter', to: 'inch' }
    ],
    'mass': [
      { from: 'kilogram', to: 'pound' },
      { from: 'gram', to: 'ounce' },
      { from: 'metric-ton', to: 'us-ton' },
      { from: 'kilogram', to: 'stone' }
    ],
    'temperature': [
      { from: 'celsius', to: 'fahrenheit' },
      { from: 'kelvin', to: 'celsius' },
      { from: 'fahrenheit', to: 'kelvin' }
    ],
    'volume': [
      { from: 'liter', to: 'gallon' },
      { from: 'milliliter', to: 'fluid-ounce' },
      { from: 'cubic-meter', to: 'cubic-foot' }
    ],
    'area': [
      { from: 'square-meter', to: 'square-foot' },
      { from: 'hectare', to: 'acre' },
      { from: 'square-kilometer', to: 'square-mile' }
    ],
    'time': [
      { from: 'second', to: 'minute' },
      { from: 'hour', to: 'day' },
      { from: 'day', to: 'week' }
    ],
    'speed': [
      { from: 'kilometer-per-hour', to: 'mile-per-hour' },
      { from: 'meter-per-second', to: 'foot-per-second' },
      { from: 'knot', to: 'mile-per-hour' }
    ],
    'data': [
      { from: 'megabyte', to: 'gigabyte' },
      { from: 'kilobyte', to: 'megabyte' },
      { from: 'gigabyte', to: 'terabyte' }
    ],
    'energy': [
      { from: 'joule', to: 'calorie' },
      { from: 'kilowatt-hour', to: 'joule' },
      { from: 'electron-volt', to: 'joule' }
    ]
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
    { url: `${baseUrl}/convert/volume/liter/gallon`, image: '/images/conversions/liter-to-gallon.webp' },
    { url: `${baseUrl}/blog/why-metric-system-worldwide`, image: '/images/blog/metric-system-map.webp' },
    { url: `${baseUrl}/blog/common-conversion-mistakes`, image: '/images/blog/conversion-mistakes.webp' },
    { url: `${baseUrl}/blog/recipe-measurements-abroad`, image: '/images/blog/international-cooking.webp' },
    { url: `${baseUrl}/blog/unit-conversion-history`, image: '/images/blog/ancient-measurements.webp' }
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
    },
    {
      slug: 'imperial-vs-metric-system',
      lastmod: '2023-05-22',
      changefreq: 'monthly',
      priority: '0.8'
    },
    {
      slug: 'temperature-conversion-guide',
      lastmod: '2023-06-10',
      changefreq: 'monthly',
      priority: '0.8'
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

// Generate sitemap for news articles (for Google News)
async function generateNewsSitemap(outputDir, baseUrl) {
  // Recent news articles
  const newsArticles = [
    {
      title: 'New SI Units Announced by International Bureau',
      slug: 'new-si-units-announced',
      publication_date: '2023-09-14T08:30:00+00:00'
    },
    {
      title: 'US Considering Metric System for Federal Projects',
      slug: 'us-considering-metric-system',
      publication_date: '2023-09-10T14:15:00+00:00'
    }
  ];

  const newsDate = new Date().toISOString().split('T')[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsArticles.map(article => `  <url>
    <loc>${baseUrl}/news/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Calcq</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${article.publication_date}</news:publication_date>
      <news:title>${article.title}</news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.resolve(outputDir, 'sitemap-news.xml'), sitemap);
  console.log('News sitemap generated successfully');
}

// Generate sitemap for video content
async function generateVideoSitemap(outputDir, baseUrl) {
  // Video tutorials
  const videoContent = [
    {
      title: 'How to Convert Units of Measurement',
      slug: 'how-to-convert-units',
      thumbnail: '/videos/thumbnails/how-to-convert.jpg',
      description: 'A complete tutorial on converting units of measurement with Calcq',
      content_loc: '/videos/how-to-convert-units.mp4',
      player_loc: 'https://www.youtube.com/embed/abc123',
      duration: 320 // seconds
    },
    {
      title: 'Understanding the Metric System',
      slug: 'understanding-metric-system',
      thumbnail: '/videos/thumbnails/metric-system.jpg',
      description: 'Learn all about the metric system and why it\'s used worldwide',
      content_loc: '/videos/metric-system-explained.mp4',
      player_loc: 'https://www.youtube.com/embed/def456',
      duration: 450 // seconds
    }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videoContent.map(video => `  <url>
    <loc>${baseUrl}/videos/${video.slug}</loc>
    <video:video>
      <video:thumbnail_loc>${baseUrl}${video.thumbnail}</video:thumbnail_loc>
      <video:title>${video.title}</video:title>
      <video:description>${video.description}</video:description>
      <video:content_loc>${baseUrl}${video.content_loc}</video:content_loc>
      <video:player_loc>${video.player_loc}</video:player_loc>
      <video:duration>${video.duration}</video:duration>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.resolve(outputDir, 'sitemap-videos.xml'), sitemap);
  console.log('Video sitemap generated successfully');
}

// Generate mobile-specific sitemap
async function generateMobileSitemap(outputDir, baseUrl) {
  // Mobile-optimized pages
  const mobileUrls = [
    `${baseUrl}/mobile/converter`,
    `${baseUrl}/mobile/historical-rates`,
    `${baseUrl}/mobile/offline-mode`
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
${mobileUrls.map(url => `  <url>
    <loc>${url}</loc>
    <mobile:mobile/>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.resolve(outputDir, 'sitemap-mobile.xml'), sitemap);
  console.log('Mobile sitemap generated successfully');
}

// Generate hreflang sitemap for internationalized content
async function generateHreflangSitemap(outputDir, baseUrl) {
  // Pages with language alternatives
  const pages = [
    {
      path: '/',
      languages: [
        { code: 'en', url: `${baseUrl}/` },
        { code: 'es', url: `${baseUrl}/es/` },
        { code: 'fr', url: `${baseUrl}/fr/` },
        { code: 'de', url: `${baseUrl}/de/` }
      ]
    },
    {
      path: '/convert/length/meter/foot',
      languages: [
        { code: 'en', url: `${baseUrl}/convert/length/meter/foot` },
        { code: 'es', url: `${baseUrl}/es/convertir/longitud/metro/pie` },
        { code: 'fr', url: `${baseUrl}/fr/convertir/longueur/metre/pied` },
        { code: 'de', url: `${baseUrl}/de/umrechnen/lange/meter/fuss` }
      ]
    }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.path}</loc>
${page.languages.map(lang => `    <xhtml:link rel="alternate" hreflang="${lang.code}" href="${lang.url}" />`).join('\n')}
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.resolve(outputDir, 'sitemap-hreflang.xml'), sitemap);
  console.log('Hreflang sitemap generated successfully');
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
    },
    {
      name: 'sitemap-news.xml',
      lastmod: new Date().toISOString().split('T')[0],
      priority: 0.9
    },
    {
      name: 'sitemap-videos.xml',
      lastmod: new Date().toISOString().split('T')[0],
      priority: 0.6
    },
    {
      name: 'sitemap-mobile.xml',
      lastmod: new Date().toISOString().split('T')[0],
      priority: 0.7
    },
    {
      name: 'sitemap-hreflang.xml',
      lastmod: new Date().toISOString().split('T')[0],
      priority: 0.8
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