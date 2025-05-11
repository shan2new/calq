import React from 'react';
import { Link } from 'react-router-dom';
import MetadataManager from '../components/SEO/MetadataManager';
import { ArticleStructuredData } from '../components/SEO/StructuredData';
import { ResponsiveImage } from '../components/ui/ResponsiveImage';

// Sample blog post data - in a real implementation, this would come from a CMS or API
const blogPosts = [
  {
    id: 'why-metric-system-worldwide',
    title: 'Why the Metric System is Used Worldwide Except in the US',
    slug: 'why-metric-system-worldwide',
    excerpt: 'Learn about the history and politics behind why most of the world uses the metric system, while the US still primarily uses imperial measurements.',
    category: 'History',
    coverImage: '/images/blog/metric-system-map.jpg',
    author: 'Alex Johnson',
    publishedDate: '2023-01-15',
    readTime: '6 min read',
    tags: ['metric', 'imperial', 'history', 'measurements']
  },
  {
    id: 'common-conversion-mistakes',
    title: '10 Common Unit Conversion Mistakes to Avoid',
    slug: 'common-conversion-mistakes',
    excerpt: 'Unit conversion errors can be costly and dangerous. Learn about the most common mistakes and how to avoid them in your calculations.',
    category: 'Tips',
    coverImage: '/images/blog/conversion-mistakes.jpg',
    author: 'Maria Rodriguez',
    publishedDate: '2023-02-10',
    readTime: '8 min read',
    tags: ['mistakes', 'conversions', 'calculations', 'tips']
  },
  {
    id: 'recipe-measurements-abroad',
    title: 'How to Convert Recipe Measurements When Cooking Abroad',
    slug: 'recipe-measurements-abroad',
    excerpt: 'Cooking with international recipes often requires converting between different measurement systems. Here\'s your guide to cooking success anywhere in the world.',
    category: 'Cooking',
    coverImage: '/images/blog/international-cooking.jpg',
    author: 'Jean Dupont',
    publishedDate: '2023-03-05',
    readTime: '5 min read',
    tags: ['cooking', 'recipes', 'international', 'measurements']
  },
  {
    id: 'unit-conversion-history',
    title: 'The Fascinating History of Unit Conversions',
    slug: 'unit-conversion-history',
    excerpt: 'From ancient civilizations to modern standardization, the history of unit conversions reveals much about human culture and scientific progress.',
    category: 'History',
    coverImage: '/images/blog/ancient-measurements.jpg',
    author: 'Alex Johnson',
    publishedDate: '2023-04-18',
    readTime: '7 min read',
    tags: ['history', 'measurements', 'standardization', 'science']
  }
];

const Blog: React.FC = () => {
  const featuredPost = blogPosts[0];
  const recentPosts = blogPosts.slice(1);
  
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <MetadataManager
        title="Unit Conversion Blog | Tips, History, and Guides | Calcq"
        description="Explore our blog for insightful articles about unit conversions, measurement history, practical tips, and guides to make conversions easier."
        keywords="unit conversion blog, measurement articles, conversion guides, measurement history, conversion tips"
      />
      
      {/* Featured article structured data */}
      <ArticleStructuredData
        title={featuredPost.title}
        description={featuredPost.excerpt}
        datePublished={featuredPost.publishedDate}
        dateModified={featuredPost.publishedDate}
        imageUrl={`https://calcq.app${featuredPost.coverImage}`}
        url={`https://calcq.app/blog/${featuredPost.slug}`}
        category={featuredPost.category}
      />
      
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Unit Conversion Blog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Insights, tips, and stories about measurements and conversions from around the world
        </p>
      </header>
      
      {/* Featured post */}
      <div className="mb-16">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6">Featured Article</h2>
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div className="h-64 md:h-full relative">
                <ResponsiveImage
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2 p-6 md:p-8">
              <div className="flex items-center text-sm mb-2">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md">{featuredPost.category}</span>
                <span className="mx-2">•</span>
                <span className="text-muted-foreground">{featuredPost.publishedDate}</span>
                <span className="mx-2">•</span>
                <span className="text-muted-foreground">{featuredPost.readTime}</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">{featuredPost.title}</h3>
              <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">By {featuredPost.author}</div>
                </div>
                <Link 
                  to={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent posts */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Recent Articles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPosts.map(post => (
            <article key={post.id} className="bg-card border rounded-lg overflow-hidden flex flex-col h-full">
              <div className="h-48 relative">
                <ResponsiveImage
                  src={post.coverImage}
                  alt={post.title}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 right-0 m-3">
                  <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded-md">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <p className="text-muted-foreground mb-4 flex-1">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">{post.publishedDate}</div>
                  <div className="text-muted-foreground">{post.readTime}</div>
                </div>
                <Link 
                  to={`/blog/${post.slug}`}
                  className="mt-4 text-center px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors w-full"
                >
                  Read Article
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
      
      {/* Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['History', 'Tips', 'Cooking', 'Science', 'Engineering', 'Travel'].map(category => (
            <Link 
              key={category}
              to={`/blog/category/${category.toLowerCase()}`}
              className="bg-card border rounded-md p-5 text-center hover:bg-card/80 transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Newsletter Signup */}
      <div className="bg-card border rounded-lg p-6 md:p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Get the latest articles, conversion guides, and measurement tips delivered directly to your inbox.
        </p>
        <form className="flex flex-col md:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};

export default Blog; 