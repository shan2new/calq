import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MetadataManager from '../components/SEO/MetadataManager';
import { ArticleStructuredData, FAQStructuredData } from '../components/SEO/StructuredData';
import { ResponsiveImage } from '../components/ui/ResponsiveImage';
import { Breadcrumbs, BreadcrumbsStructuredData, generateConversionBreadcrumbs } from '../components/SEO/Breadcrumbs';

// Sample blog posts - in a real implementation, this would come from a CMS or API
const blogPosts = {
  'why-metric-system-worldwide': {
    id: 'why-metric-system-worldwide',
    title: 'Why the Metric System is Used Worldwide Except in the US',
    slug: 'why-metric-system-worldwide',
    excerpt: 'Learn about the history and politics behind why most of the world uses the metric system, while the US still primarily uses imperial measurements.',
    content: `
      <h2>The Global Standard That America Skipped</h2>
      <p>The metric system, officially known as the International System of Units (SI), is used by nearly every country in the world—with the United States being the notable exception. This article explores why the metric system became the global standard and why the US continues to primarily use customary units (the imperial system).</p>
      
      <h2>A Brief History of the Metric System</h2>
      <p>The metric system originated during the French Revolution in the late 18th century. It was designed as a rational, decimal-based system of measurement that would be "for all people, for all time." Unlike earlier systems that were based on arbitrary standards like the length of a king's foot, the metric system was intended to be based on natural constants.</p>
      
      <p>In 1875, the Treaty of the Meter was signed by 17 nations, establishing the International Bureau of Weights and Measures. This organization was tasked with maintaining international standards for measurement and promoting the adoption of the metric system worldwide.</p>
      
      <h2>Why Did Most Countries Adopt the Metric System?</h2>
      <p>The metric system offered several advantages that led to its widespread adoption:</p>
      <ul>
        <li>Decimal-based units that make calculations simpler</li>
        <li>Standardized prefixes (milli-, centi-, kilo-, etc.) that apply across all types of measurements</li>
        <li>Coherent relationships between units (e.g., 1 cubic centimeter of water equals 1 milliliter and weighs 1 gram)</li>
        <li>International standardization that facilitates trade and scientific exchange</li>
      </ul>
      
      <p>Countries typically adopted the metric system during periods of significant political change or modernization. For example, many European nations adopted the system during the 19th century, while countries in Asia and Africa often adopted it upon gaining independence in the 20th century.</p>
      
      <h2>The United States: A Metric Holdout</h2>
      <p>The United States has had a complicated relationship with the metric system. In 1975, Congress passed the Metric Conversion Act, which declared the metric system "the preferred system of weights and measures for United States trade and commerce." However, the act made the conversion voluntary, not mandatory.</p>
      
      <p>Several factors have contributed to America's resistance to full metric adoption:</p>
      <ul>
        <li>The cost of converting infrastructure, tools, and manufacturing processes</li>
        <li>Cultural inertia and familiarity with customary units</li>
        <li>Decentralized governance that makes nationwide standardization difficult</li>
        <li>The perception that the metric system is "foreign" or "un-American"</li>
      </ul>
      
      <p>Despite these barriers, the metric system is actually widely used in specific sectors within the United States. American scientists, the military, and many industries (especially those that operate globally) use metric units extensively.</p>
      
      <h2>Partial Metrication in America</h2>
      <p>The U.S. is actually more metricated than many Americans realize:</p>
      <ul>
        <li>Food and beverages are often labeled in both systems (e.g., 2-liter soda bottles)</li>
        <li>Pharmaceuticals and medical dosing use exclusively metric measurements</li>
        <li>The U.S. dollar is decimal-based, unlike the old British pound with its shillings and pence</li>
        <li>American athletes compete in metric distances (100-meter dash, etc.) at the Olympics</li>
      </ul>
      
      <h2>Will the US Ever Fully Convert?</h2>
      <p>Complete conversion to the metric system in the United States seems unlikely in the near future. The current dual-system approach—where both systems coexist in different contexts—appears to be the path of least resistance, even if it occasionally leads to confusion and errors.</p>
      
      <p>Perhaps the most famous such error occurred in 1999, when NASA lost the $125 million Mars Climate Orbiter because one team used metric units while another used imperial units in their calculations.</p>
      
      <h2>Conclusion</h2>
      <p>The metric system continues to be the international standard for measurement, with the United States as the only major country that has not fully adopted it. While this exceptionalism creates some inefficiencies and occasional errors, Americans have largely adapted to living in a world with two parallel systems of measurement.</p>
      
      <p>For those dealing with international contexts or scientific work, understanding both systems and being able to convert between them remains an essential skill—and one that Americans may need to maintain longer than citizens of most other countries.</p>
    `,
    category: 'History',
    coverImage: '/images/blog/metric-system-map.jpg',
    author: 'Alex Johnson',
    publishedDate: '2023-01-15',
    modifiedDate: '2023-01-20',
    readTime: '6 min read',
    tags: ['metric', 'imperial', 'history', 'measurements'],
    relatedArticles: ['common-conversion-mistakes', 'unit-conversion-history'],
    faqs: [
      {
        question: "Why doesn't the US use the metric system?",
        answer: "The US hasn't fully adopted the metric system due to several factors including the high cost of converting infrastructure, cultural inertia, decentralized governance making nationwide standardization difficult, and the perception that the metric system is 'foreign'."
      },
      {
        question: "When was the metric system invented?",
        answer: "The metric system originated during the French Revolution in the late 18th century (1790s) as a rational, decimal-based system of measurement."
      },
      {
        question: "Do any other countries besides the US not use the metric system?",
        answer: "While the US is the most notable non-metric country, Myanmar (Burma) and Liberia have also not fully adopted the metric system, though they use it in some contexts."
      },
      {
        question: "Does the US use the metric system at all?",
        answer: "Yes, the US uses the metric system in many scientific, medical, military, and industrial contexts. Many products are labeled with both systems, and certain industries are fully metric."
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
      if (slug && blogPosts[slug]) {
        setPost(blogPosts[slug]);
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
        imageUrl={`https://calcq.app${post.coverImage}`}
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
        <ResponsiveImage
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
          {post.tags.map(tag => (
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
            {post.relatedArticles.map(relatedSlug => {
              const relatedPost = blogPosts[relatedSlug];
              if (!relatedPost) return null;
              
              return (
                <div key={relatedSlug} className="bg-card border rounded-lg overflow-hidden flex flex-col">
                  <div className="h-40 relative">
                    <ResponsiveImage
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
      <div className="bg-card border rounded-lg p-6 mt-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Need Help With Unit Conversions?</h2>
        <p className="mb-6">Try our free unit converter for quick, accurate calculations</p>
        <Link 
          to="/converter"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Use The Converter
        </Link>
      </div>
    </div>
  );
};

export default BlogPost; 