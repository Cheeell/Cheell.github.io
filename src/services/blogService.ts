// Blog service for managing blog posts from JSON files
import { blogDatabaseService } from './blogDatabaseService';
import type { BlogPostRecord } from './blogDatabaseService';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  views: number;
  featured: boolean;
  seoTitle: string;
  metaDescription: string;
  slug: string;
  contentFile?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  description: string;
  postCount: number;
}

class BlogService {
  private static postsCache: BlogPost[] | null = null;
  private static lastCacheTime: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static useDatabase: boolean = true; // Toggle between database and JSON

  // Load blog posts from JSON files
  static async getAllPosts(): Promise<BlogPost[]> {
    try {
      // Try database first, fallback to JSON files
      if (this.useDatabase) {
        try {
          const dbPosts = await blogDatabaseService.getAllPosts(true); // Include unpublished for admin
          if (dbPosts.length > 0) {
            console.log(`Loaded ${dbPosts.length} posts from database`);
            return dbPosts.map(this.transformDatabasePost);
          }
        } catch (dbError) {
          console.warn('Database posts loading failed, falling back to JSON:', dbError);
        }
      }

      // Check cache first
      const now = Date.now();
      if (this.postsCache && (now - this.lastCacheTime) < this.CACHE_DURATION) {
        return this.postsCache;
      }

      console.log('Loading blog posts from JSON files...');

      // Load posts index
      const postsResponse = await fetch('/blog/posts.json');
      if (!postsResponse.ok) {
        throw new Error(`Failed to load posts index: ${postsResponse.status}`);
      }
      
      const postsIndex: Omit<BlogPost, 'content'>[] = await postsResponse.json();
      
      // Load content for each post
      const posts: BlogPost[] = await Promise.all(
        postsIndex.map(async (post) => {
          try {
            if (post.contentFile) {
              const contentResponse = await fetch(`/blog/content/${post.contentFile}`);
              if (contentResponse.ok) {
                const contentData = await contentResponse.json();
                return {
                  ...post,
                  content: contentData.content
                };
              }
            }
            
            // Fallback to empty content if file not found
            console.warn(`Content file not found for post: ${post.id}`);
            return {
              ...post,
              content: '<p>Content not available</p>'
            };
          } catch (error) {
            console.error(`Error loading content for post ${post.id}:`, error);
            return {
              ...post,
              content: '<p>Error loading content</p>'
            };
          }
        })
      );

      // Update cache
      this.postsCache = posts;
      this.lastCacheTime = now;

      console.log(`Loaded ${posts.length} blog posts successfully`);
      return posts;

    } catch (error) {
      console.error('Error loading blog posts:', error);
      
      // Return fallback data if JSON loading fails
      return this.getFallbackPosts();
    }
  }

  // Transform database post to BlogPost interface
  private static transformDatabasePost(dbPost: BlogPostRecord): BlogPost {
    return {
      id: dbPost.id,
      title: dbPost.title,
      excerpt: dbPost.excerpt,
      content: dbPost.content,
      author: dbPost.author,
      publishDate: new Date(dbPost.publishDate).toISOString().split('T')[0],
      readTime: blogDatabaseService.generateReadTime(dbPost.content),
      category: dbPost.category,
      tags: dbPost.tags,
      image: dbPost.image || 'https://images.pexels.com/photos/267389/pexels-photo-267389.jpeg?auto=compress&cs=tinysrgb&w=800',
      views: dbPost.views,
      featured: dbPost.featured,
      published: dbPost.published,
      seoTitle: dbPost.seoTitle,
      metaDescription: dbPost.metaDescription,
      slug: dbPost.slug
    };
  }

  // Get a single post by slug
  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    // Try database first
    if (this.useDatabase) {
      try {
        const dbPost = await blogDatabaseService.getPostBySlug(slug);
        if (dbPost) {
          return this.transformDatabasePost(dbPost);
        }
      } catch (dbError) {
        console.warn('Database post lookup failed, falling back to JSON:', dbError);
      }
    }

    // Fallback to JSON files
    const posts = await this.getAllPosts();
    return posts.find(post => post.slug === slug) || null;
  }

  // Get posts by category
  static async getPostsByCategory(category: string): Promise<BlogPost[]> {
    // Try database first
    if (this.useDatabase) {
      try {
        const dbPosts = await blogDatabaseService.getPostsByCategory(category);
        if (dbPosts.length > 0) {
          return dbPosts.map(this.transformDatabasePost);
        }
      } catch (dbError) {
        console.warn('Database category lookup failed, falling back to JSON:', dbError);
      }
    }

    // Fallback to JSON files
    const posts = await this.getAllPosts();
    return posts.filter(post => post.category === category);
  }

  // Get featured posts
  static async getFeaturedPosts(limit: number = 3): Promise<BlogPost[]> {
    // Try database first
    if (this.useDatabase) {
      try {
        const dbPosts = await blogDatabaseService.getFeaturedPosts(limit);
        if (dbPosts.length > 0) {
          return dbPosts.map(this.transformDatabasePost);
        }
      } catch (dbError) {
        console.warn('Database featured posts lookup failed, falling back to JSON:', dbError);
      }
    }

    // Fallback to JSON files
    const posts = await this.getAllPosts();
    return posts.filter(post => post.featured).slice(0, limit);
  }

  // Search posts
  static async searchPosts(query: string): Promise<BlogPost[]> {
    // Try database first
    if (this.useDatabase) {
      try {
        const dbPosts = await blogDatabaseService.searchPosts(query);
        if (dbPosts.length > 0) {
          return dbPosts.map(this.transformDatabasePost);
        }
      } catch (dbError) {
        console.warn('Database search failed, falling back to JSON:', dbError);
      }
    }

    // Fallback to JSON files
    const posts = await this.getAllPosts();
    const searchTerm = query.toLowerCase();
    
    return posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      post.category.toLowerCase().includes(searchTerm)
    );
  }

  // Get all categories with post counts
  static async getCategories(): Promise<BlogCategory[]> {
    // Try database first
    if (this.useDatabase) {
      try {
        const dbCategories = await blogDatabaseService.getCategories();
        if (dbCategories.length > 0) {
          return dbCategories.map(cat => ({
            id: cat.name.toLowerCase().replace(/\s+/g, '-'),
            name: cat.name,
            description: `${cat.count} articles about ${cat.name.toLowerCase()}`,
            postCount: cat.count
          }));
        }
      } catch (dbError) {
        console.warn('Database categories lookup failed, falling back to JSON:', dbError);
      }
    }

    // Fallback to JSON files
    const posts = await this.getAllPosts();
    const categoryMap = new Map<string, number>();
    
    posts.forEach(post => {
      categoryMap.set(post.category, (categoryMap.get(post.category) || 0) + 1);
    });

    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      description: `${count} articles about ${name.toLowerCase()}`,
      postCount: count
    }));
  }

  // Get related posts
  static async getRelatedPosts(currentPost: BlogPost, limit: number = 3): Promise<BlogPost[]> {
    const allPosts = await this.getAllPosts();
    
    const related = allPosts
      .filter(post => post.id !== currentPost.id)
      .map(post => {
        let score = 0;
        
        // Same category gets higher score
        if (post.category === currentPost.category) score += 3;
        
        // Shared tags get points
        const sharedTags = post.tags.filter(tag => currentPost.tags.includes(tag));
        score += sharedTags.length;
        
        return { post, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.post);

    return related;
  }

  // Fallback posts if JSON loading fails
  private static getFallbackPosts(): BlogPost[] {
    return [
      {
        id: 'fallback-post',
        title: 'Blog System Loading...',
        excerpt: 'The blog system is currently loading content from JSON files.',
        content: '<p>Blog content is being loaded from JSON files. Please refresh the page.</p>',
        author: 'System',
        publishDate: new Date().toISOString().split('T')[0],
        readTime: '1 min read',
        category: 'System',
        tags: ['Loading'],
        image: 'https://images.pexels.com/photos/267389/pexels-photo-267389.jpeg?auto=compress&cs=tinysrgb&w=800',
        views: 0,
        featured: false,
        seoTitle: 'Blog Loading',
        metaDescription: 'Blog content is loading',
        slug: 'loading'
      }
    ];
  }

  // Clear cache (useful for development)
  static clearCache(): void {
    this.postsCache = null;
    this.lastCacheTime = 0;
  }

  // Toggle between database and JSON file mode
  static setDatabaseMode(enabled: boolean): void {
    this.useDatabase = enabled;
    this.clearCache();
  }

  // SEO optimization helpers
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  static generateMetaDescription(excerpt: string, maxLength: number = 160): string {
    if (excerpt.length <= maxLength) return excerpt;
    return excerpt.substring(0, maxLength - 3).trim() + '...';
  }

  static generateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }

  // Schema.org structured data for SEO
  static generateBlogPostSchema(post: BlogPost): object {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.metaDescription,
      "image": post.image,
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "StrategyAI",
        "logo": {
          "@type": "ImageObject",
          "url": "https://strategyai.com/logo.png"
        }
      },
      "datePublished": post.publishDate,
      "dateModified": post.publishDate,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://strategyai.com/blog/${post.slug}`
      }
    };
  }

  // SEO-optimized keywords for different categories
  static getCategoryKeywords(category: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'AI Marketing': [
        'ai marketing strategies',
        'artificial intelligence marketing',
        'marketing automation',
        'ai powered marketing',
        'machine learning marketing'
      ],
      'Small Business': [
        'small business marketing',
        'marketing for small business',
        'budget marketing strategies',
        'local business marketing',
        'startup marketing'
      ],
      'Social Media': [
        'social media marketing',
        'social media strategy',
        'social media trends',
        'social media advertising',
        'social media engagement'
      ],
      'Email Marketing': [
        'email marketing strategies',
        'email marketing best practices',
        'email automation',
        'email marketing roi',
        'email marketing tips'
      ],
      'Content Marketing': [
        'content marketing strategy',
        'content marketing roi',
        'content marketing tips',
        'content creation',
        'content marketing trends'
      ],
      'Digital Marketing': [
        'digital marketing strategies',
        'digital marketing trends',
        'online marketing',
        'digital marketing tips',
        'digital advertising'
      ]
    };

    return keywordMap[category] || [];
  }

  // Generate sitemap entries for blog posts
  static async generateSitemapEntries(): Promise<string[]> {
    const posts = await this.getAllPosts();
    return posts.map(post => 
      `https://strategyai.com/blog/${post.slug}`
    );
  }

  // SEO-friendly URL structure
  static generateCanonicalUrl(post: BlogPost): string {
    return `https://strategyai.com/blog/${post.slug}`;
  }

  // Open Graph meta tags for social sharing
  static generateOpenGraphTags(post: BlogPost): Record<string, string> {
    return {
      'og:title': post.seoTitle,
      'og:description': post.metaDescription,
      'og:image': post.image,
      'og:url': this.generateCanonicalUrl(post),
      'og:type': 'article',
      'og:site_name': 'StrategyAI',
      'article:author': post.author,
      'article:published_time': post.publishDate,
      'article:section': post.category,
      'article:tag': post.tags.join(',')
    };
  }

  // Twitter Card meta tags
  static generateTwitterCardTags(post: BlogPost): Record<string, string> {
    return {
      'twitter:card': 'summary_large_image',
      'twitter:title': post.seoTitle,
      'twitter:description': post.metaDescription,
      'twitter:image': post.image,
      'twitter:site': '@StrategyAI',
      'twitter:creator': `@${post.author.replace(' ', '')}`
    };
  }

  // Generate FAQ schema for blog posts
  static generateFAQSchema(questions: Array<{question: string, answer: string}>): object {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": questions.map(qa => ({
        "@type": "Question",
        "name": qa.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": qa.answer
        }
      }))
    };
  }

  // Content optimization suggestions
  static analyzeContentSEO(post: BlogPost): {
    score: number;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let score = 100;

    // Title length check
    if (post.title.length < 30 || post.title.length > 60) {
      suggestions.push('Title should be between 30-60 characters for optimal SEO');
      score -= 10;
    }

    // Meta description check
    if (post.metaDescription.length < 120 || post.metaDescription.length > 160) {
      suggestions.push('Meta description should be between 120-160 characters');
      score -= 10;
    }

    // Content length check
    const wordCount = post.content.split(/\s+/).length;
    if (wordCount < 300) {
      suggestions.push('Content should be at least 300 words for better SEO');
      score -= 15;
    }

    // Tags check
    if (post.tags.length < 3) {
      suggestions.push('Add at least 3 relevant tags for better categorization');
      score -= 5;
    }

    // Image alt text check (would need to be implemented in component)
    suggestions.push('Ensure all images have descriptive alt text');

    return { score: Math.max(0, score), suggestions };
  }

  // Admin methods for managing blog content
  static async addPost(post: Omit<BlogPost, 'id' | 'views'>): Promise<boolean> {
    try {
      // Save to database if enabled
      if (this.useDatabase) {
        const postData = {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          category: post.category,
          tags: post.tags,
          image: post.image,
          featured: post.featured,
          published: post.published !== undefined ? post.published : true,
          seoTitle: post.seoTitle,
          metaDescription: post.metaDescription
        };

        const savedPost = await blogDatabaseService.createPost(postData);
        if (savedPost) {
          console.log('Blog post saved to database:', savedPost.id);
          this.clearCache();
          return true;
        }
      }

      console.log('Adding new blog post:', post.title);
      
      // Clear cache to force reload
      this.clearCache();
      
      return true;
    } catch (error) {
      console.error('Error adding blog post:', error);
      return false;
    }
  }

  static async updatePost(id: string, updates: Partial<BlogPost>): Promise<boolean> {
    try {
      // Update in database if enabled
      if (this.useDatabase) {
        const updateData = {
          title: updates.title,
          excerpt: updates.excerpt,
          content: updates.content,
          author: updates.author,
          category: updates.category,
          tags: updates.tags,
          image: updates.image,
          featured: updates.featured,
          published: updates.published,
          seoTitle: updates.seoTitle,
          metaDescription: updates.metaDescription
        };

        const updatedPost = await blogDatabaseService.updatePost(id, updateData);
        if (updatedPost) {
          console.log('Blog post updated in database:', id);
          this.clearCache();
          return true;
        }
      }

      console.log('Updating blog post:', id, updates);
      
      // Clear cache to force reload
      this.clearCache();
      
      return true;
    } catch (error) {
      console.error('Error updating blog post:', error);
      return false;
    }
  }

  static async deletePost(id: string): Promise<boolean> {
    try {
      // Delete from database if enabled
      if (this.useDatabase) {
        const deleted = await blogDatabaseService.deletePost(id);
        if (deleted) {
          console.log('Blog post deleted from database:', id);
          this.clearCache();
          return true;
        }
      }

      console.log('Deleting blog post:', id);
      
      // Clear cache to force reload
      this.clearCache();
      
      return true;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
  }

  // Analytics methods
  static async incrementViews(postId: string): Promise<void> {
    try {
      // Update views in database if enabled
      if (this.useDatabase) {
        await blogDatabaseService.incrementViews(postId);
      }

      console.log('Incrementing views for post:', postId);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  static async getPopularPosts(limit: number = 5): Promise<BlogPost[]> {
    const posts = await this.getAllPosts();
    return posts
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  static async getRecentPosts(limit: number = 5): Promise<BlogPost[]> {
    const posts = await this.getAllPosts();
    return posts
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
      .slice(0, limit);
  }

  // Content management helpers
  static validatePost(post: Partial<BlogPost>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!post.title || post.title.trim().length < 10) {
      errors.push('Title must be at least 10 characters long');
    }

    if (!post.excerpt || post.excerpt.trim().length < 50) {
      errors.push('Excerpt must be at least 50 characters long');
    }

    if (!post.content || post.content.trim().length < 200) {
      errors.push('Content must be at least 200 characters long');
    }

    if (!post.author || post.author.trim().length < 2) {
      errors.push('Author name is required');
    }

    if (!post.category || post.category.trim().length < 2) {
      errors.push('Category is required');
    }

    if (!post.tags || post.tags.length < 2) {
      errors.push('At least 2 tags are required');
    }

    if (!post.image || !post.image.startsWith('http')) {
      errors.push('Valid image URL is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate blog post from template
  static generatePostTemplate(category: string): Partial<BlogPost> {
    const templates = {
      'AI Marketing': {
        title: 'AI Marketing Strategy for [Industry]',
        excerpt: 'Discover how AI can transform your marketing approach in the [industry] sector.',
        tags: ['AI', 'Marketing Strategy', 'Automation'],
        content: '<h2>Introduction</h2><p>AI is revolutionizing marketing...</p>'
      },
      'Small Business': {
        title: 'Small Business Marketing Guide for [Industry]',
        excerpt: 'Cost-effective marketing strategies specifically designed for small businesses.',
        tags: ['Small Business', 'Budget Marketing', 'Growth'],
        content: '<h2>Getting Started</h2><p>Small businesses face unique challenges...</p>'
      },
      'Social Media': {
        title: 'Social Media Strategy for [Year]',
        excerpt: 'Latest social media trends and strategies to grow your audience.',
        tags: ['Social Media', 'Trends', 'Engagement'],
        content: '<h2>Current Landscape</h2><p>Social media continues to evolve...</p>'
      }
    };

    const template = templates[category as keyof typeof templates] || templates['AI Marketing'];
    
    return {
      ...template,
      category,
      author: 'StrategyAI Team',
      publishDate: new Date().toISOString().split('T')[0],
      readTime: '5 min read',
      image: 'https://images.pexels.com/photos/267389/pexels-photo-267389.jpeg?auto=compress&cs=tinysrgb&w=800',
      featured: false,
      views: 0
    };
  }
}

export default BlogService;