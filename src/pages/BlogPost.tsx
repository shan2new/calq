import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MetadataManager from '../components/SEO/MetadataManager';
import { ArticleStructuredData, FAQStructuredData } from '../components/SEO/StructuredData';
import OptimizedImage from '../components/ui/OptimizedImage';
import { Breadcrumbs, BreadcrumbsStructuredData } from '../components/SEO/Breadcrumbs';

// Sample blog posts - in a real implementation, this would come from a CMS or API
const blogPosts = {
  'why-metric-system-worldwide': {
    id: 'why-metric-system-worldwide',
    title: 'Why the Metric System is Used Worldwide Except in the US',
    slug: 'why-metric-system-worldwide',
    excerpt: 'Learn about the history and politics behind why most of the world uses the metric system, while the US still primarily uses imperial measurements.',
    content: `
      <p>In 1799, France introduced the world to the metric system as a standardized way of measurement. Today, nearly every country in the world uses the metric system as their official system of weights and measures, with the United States being a notable exception.</p>
      
      <h2>The Birth of the Metric System</h2>
      <p>The metric system originated during the French Revolution as a way to streamline and standardize measurements across the country. Before this, measurements varied widely between regions, making trade and communication difficult. The new system was based on decimal units and natural constants, making it scientifically sound and easy to convert between units.</p>
      
      <h2>Global Adoption</h2>
      <p>Throughout the 19th and 20th centuries, countries around the world began to adopt the metric system. Its logical structure and ease of use in scientific and technical fields made it increasingly attractive as international trade grew.</p>
      
      <h2>Why the US Hasn't Fully Converted</h2>
      <p>The United States actually has an interesting history with the metric system. In 1975, Congress passed the Metric Conversion Act, which declared the metric system "the preferred system of weights and measures for United States trade and commerce." However, the act was voluntary, and the expected transition never fully materialized.</p>
      
      <p>Several factors have contributed to the US's continued use of imperial measurements:</p>
      
      <ul>
        <li>The cost of transitioning infrastructure, tools, and manufacturing processes</li>
        <li>Cultural resistance to change</li>
        <li>The fact that many US industries that operate globally already use the metric system internally</li>
      </ul>
      
      <h2>The Hybrid Approach</h2>
      <p>Interestingly, the US operates on a hybrid system. Many scientific fields, medicine, and the military exclusively use metric units. Liquor and wine are sold in metric volumes, and nutrition labels display both systems.</p>
      
      <h2>The Importance of Conversion Tools</h2>
      <p>With two systems in use worldwide, conversion tools like Calcq play an essential role in bridging the measurement gap. Whether you're following a recipe from another country, working on an international project, or trying to understand weather forecasts while traveling, reliable conversion between imperial and metric units remains critical.</p>
    `,
    category: 'History',
    coverImage: '/images/blog/metric-system-map.jpg',
    author: 'Alex Johnson',
    publishedDate: '2023-01-15',
    modifiedDate: '2023-01-20',
    readTime: '6 min read',
    tags: ['metric', 'imperial', 'history', 'measurements'],
    relatedArticles: ['common-conversion-mistakes', 'recipe-measurements-abroad'],
    faqs: [
      {
        question: 'When was the metric system invented?',
        answer: 'The metric system was invented in France in 1799 during the French Revolution as a standardized measurement system based on decimal units.'
      },
      {
        question: 'Why doesn\'t the US use the metric system?',
        answer: 'While the US officially recognizes the metric system, it hasn\'t fully transitioned due to factors like the cost of infrastructure changes, cultural resistance, and the fact that many industries already use metric internally.'
      },
      {
        question: 'Do any other countries besides the US not use the metric system?',
        answer: 'Myanmar (Burma) and Liberia are the only other countries that haven\'t officially adopted the metric system, though both use it in some contexts.'
      }
    ]
  },
  
  'common-conversion-mistakes': {
    id: 'common-conversion-mistakes',
    title: '10 Common Unit Conversion Mistakes to Avoid',
    slug: 'common-conversion-mistakes',
    excerpt: 'Unit conversion errors can be costly and dangerous. Learn about the most common mistakes and how to avoid them in your calculations.',
    content: '<p>This is a placeholder for the full content of this article.</p>',
    category: 'Tips',
    coverImage: '/images/blog/conversion-mistakes.jpg',
    author: 'Maria Rodriguez',
    publishedDate: '2023-02-10',
    modifiedDate: '2023-02-15',
    readTime: '8 min read',
    tags: ['mistakes', 'conversions', 'calculations', 'tips'],
    relatedArticles: ['why-metric-system-worldwide', 'recipe-measurements-abroad'],
    faqs: []
  }
  // Additional articles would be added here
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch article data - in a real app, this would be an API call
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      if (slug && blogPosts[slug as keyof typeof blogPosts]) {
        setPost(blogPosts[slug as keyof typeof blogPosts]);
      }
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [slug]);
  
  // Generate breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    post ? { name: post.title, url: `/blog/${post.slug}` } : { name: 'Article', url: '#' }
  ];
  
  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/4 mb-12"></div>
          <div className="h-64 bg-muted rounded mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold">Article Not Found</h1>
        <p className="mt-4">Sorry, we couldn't find the article you're looking for.</p>
        <Link to="/blog" className="mt-6 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md">
          Return to Blog
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <MetadataManager
        title={`${post.title} | Calcq Blog`}
        description={post.excerpt}
        keywords={post.tags.join(', ')}
        publishedTime={post.publishedDate}
        modifiedTime={post.modifiedDate}
      />
      
      {/* Structured data */}
      <BreadcrumbsStructuredData items={breadcrumbs} />
      <ArticleStructuredData
        title={post.title}
        description={post.excerpt}
        datePublished={post.publishedDate}
        dateModified={post.modifiedDate || post.publishedDate}
        imageUrl={`https://calcq.app${post.coverImage}`}
        url={`https://calcq.app/blog/${post.slug}`}
        category={post.category}
      />
      
      {post.faqs && post.faqs.length > 0 && (
        <FAQStructuredData
          category={post.category}
          fromUnit=""
          toUnit=""
          questions={post.faqs}
        />
      )}
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} className="mb-6" />
      
      {/* Article header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-3 mb-6">
          <span>By {post.author}</span>
          <span>•</span>
          <span>{post.publishedDate}</span>
          <span>•</span>
          <span>{post.readTime}</span>
        </div>
      </header>
      
      {/* Cover image */}
      <div className="mb-8 rounded-lg overflow-hidden">
        <OptimizedImage
          src={post.coverImage}
          alt={post.title}
          width={1200}
          height={630}
          className="w-full object-cover"
        />
      </div>
      
      {/* Article content */}
      <article className="prose dark:prose-invert max-w-none mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />
      
      {/* Tags */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-3">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag: string) => (
            <Link key={tag} to={`/blog/tag/${tag}`} className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-muted/70">
              #{tag}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Related articles */}
      {post.relatedArticles && post.relatedArticles.length > 0 && (
        <div className="border-t pt-8 mt-8">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {post.relatedArticles.map((relatedSlug: string) => {
              const relatedPost = blogPosts[relatedSlug as keyof typeof blogPosts];
              if (!relatedPost) return null;
              
              return (
                <div key={relatedSlug} className="bg-card border rounded-lg overflow-hidden flex flex-col">
                  <div className="h-40 relative">
                    <OptimizedImage
                      src={relatedPost.coverImage}
                      alt={relatedPost.title}
                      width={600}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{relatedPost.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{relatedPost.excerpt}</p>
                    <Link
                      to={`/blog/${relatedPost.slug}`}
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Call to action */}
      <div className="bg-muted p-6 rounded-lg mb-12">
        <h3 className="text-xl font-bold mb-3">Need to Convert Units?</h3>
        <p className="mb-4">Try our accurate and easy-to-use calculator for all your conversion needs.</p>
        <Link to="/converter" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          Use Calculator
        </Link>
      </div>
    </div>
  );
};

export default BlogPost; 