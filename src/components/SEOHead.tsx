import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string | string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishDate?: string;
  category?: string;
  tags?: string[];
  structuredData?: object;
}

export default function SEOHead({
  title = 'StrategyAI - AI-Powered Marketing Strategies',
  description = 'Get personalized marketing strategies powered by AI. Transform your business with data-driven insights and actionable marketing plans.',
  keywords = 'marketing strategy, ai marketing, business growth, digital marketing',
  image = 'https://strategyai.com/og-image.jpg',
  url = 'https://strategyai.com',
  type = 'website',
  author,
  publishDate,
  category,
  tags,
  structuredData
}: SEOHeadProps) {
  const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={url} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="StrategyAI" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@StrategyAI" />

      {/* Article-specific meta tags */}
      {type === 'article' && author && (
        <>
          <meta property="article:author" content={author} />
          <meta name="twitter:creator" content={`@${author.replace(' ', '')}`} />
        </>
      )}
      
      {publishDate && (
        <meta property="article:published_time" content={publishDate} />
      )}
      
      {category && (
        <meta property="article:section" content={category} />
      )}
      
      {tags && tags.length > 0 && (
        <meta property="article:tag" content={tags.join(',')} />
      )}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Additional SEO Tags */}
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Favicon and App Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
    </Helmet>
  );
}