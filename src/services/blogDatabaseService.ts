import { supabase } from './supabaseClient';

export interface BlogPostData {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  image?: string;
  featured: boolean;
  published: boolean;
  seoTitle?: string;
  metaDescription?: string;
  publishDate?: string;
}

export interface BlogPostRecord extends BlogPostData {
  id: string;
  slug: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

class BlogDatabaseService {
  // Create a new blog post
  async createPost(postData: BlogPostData): Promise<BlogPostRecord | null> {
    try {
      console.log('Creating new blog post:', postData.title);

      // Generate SEO fields if not provided
      const seoTitle = postData.seoTitle || postData.title;
      const metaDescription = postData.metaDescription || postData.excerpt.substring(0, 160);
      const slug = this.generateSlug(postData.title);

      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title: postData.title,
          slug: slug,
          excerpt: postData.excerpt,
          content: postData.content,
          author: postData.author,
          category: postData.category,
          tags: postData.tags,
          image: postData.image,
          featured: postData.featured,
          published: postData.published,
          seo_title: seoTitle,
          meta_description: metaDescription,
          publish_date: postData.publishDate || new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating blog post:', error);
        throw new Error(`Failed to create blog post: ${error.message}`);
      }

      console.log('Blog post created successfully:', data.id);
      return this.transformRecord(data);

    } catch (error) {
      console.error('Error in createPost:', error);
      throw error;
    }
  }

  // Update an existing blog post
  async updatePost(id: string, updates: Partial<BlogPostData>): Promise<BlogPostRecord | null> {
    try {
      console.log('Updating blog post:', id);

      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.author !== undefined) updateData.author = updates.author;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.image !== undefined) updateData.image = updates.image;
      if (updates.featured !== undefined) updateData.featured = updates.featured;
      if (updates.published !== undefined) updateData.published = updates.published;
      if (updates.seoTitle !== undefined) updateData.seo_title = updates.seoTitle;
      if (updates.metaDescription !== undefined) updateData.meta_description = updates.metaDescription;
      if (updates.publishDate !== undefined) updateData.publish_date = updates.publishDate;

      const { data, error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating blog post:', error);
        throw new Error(`Failed to update blog post: ${error.message}`);
      }

      console.log('Blog post updated successfully');
      return this.transformRecord(data);

    } catch (error) {
      console.error('Error in updatePost:', error);
      throw error;
    }
  }

  // Get all blog posts
  async getAllPosts(includeUnpublished: boolean = false): Promise<BlogPostRecord[]> {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('publish_date', { ascending: false });

      if (!includeUnpublished) {
        query = query.eq('published', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching blog posts:', error);
        throw new Error(`Failed to fetch blog posts: ${error.message}`);
      }

      return (data || []).map(this.transformRecord);

    } catch (error) {
      console.error('Error in getAllPosts:', error);
      return [];
    }
  }

  // Get a single post by slug
  async getPostBySlug(slug: string): Promise<BlogPostRecord | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Post not found
        }
        console.error('Error fetching blog post by slug:', error);
        throw new Error(`Failed to fetch blog post: ${error.message}`);
      }

      // Increment view count
      await this.incrementViews(data.id);

      return this.transformRecord(data);

    } catch (error) {
      console.error('Error in getPostBySlug:', error);
      return null;
    }
  }

  // Get posts by category
  async getPostsByCategory(category: string): Promise<BlogPostRecord[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category', category)
        .eq('published', true)
        .order('publish_date', { ascending: false });

      if (error) {
        console.error('Error fetching posts by category:', error);
        throw new Error(`Failed to fetch posts by category: ${error.message}`);
      }

      return (data || []).map(this.transformRecord);

    } catch (error) {
      console.error('Error in getPostsByCategory:', error);
      return [];
    }
  }

  // Get featured posts
  async getFeaturedPosts(limit: number = 3): Promise<BlogPostRecord[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('featured', true)
        .eq('published', true)
        .order('publish_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured posts:', error);
        throw new Error(`Failed to fetch featured posts: ${error.message}`);
      }

      return (data || []).map(this.transformRecord);

    } catch (error) {
      console.error('Error in getFeaturedPosts:', error);
      return [];
    }
  }

  // Search posts
  async searchPosts(query: string): Promise<BlogPostRecord[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
        .order('publish_date', { ascending: false });

      if (error) {
        console.error('Error searching posts:', error);
        throw new Error(`Failed to search posts: ${error.message}`);
      }

      return (data || []).map(this.transformRecord);

    } catch (error) {
      console.error('Error in searchPosts:', error);
      return [];
    }
  }

  // Delete a blog post
  async deletePost(id: string): Promise<boolean> {
    try {
      console.log('Deleting blog post:', id);

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting blog post:', error);
        throw new Error(`Failed to delete blog post: ${error.message}`);
      }

      console.log('Blog post deleted successfully');
      return true;

    } catch (error) {
      console.error('Error in deletePost:', error);
      return false;
    }
  }

  // Increment view count
  async incrementViews(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ views: supabase.sql`views + 1` })
        .eq('id', id);

      if (error) {
        console.error('Error incrementing views:', error);
      }

    } catch (error) {
      console.error('Error in incrementViews:', error);
    }
  }

  // Get categories with post counts
  async getCategories(): Promise<Array<{ name: string; count: number }>> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('category')
        .eq('published', true);

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      const categoryMap = new Map<string, number>();
      data.forEach(post => {
        categoryMap.set(post.category, (categoryMap.get(post.category) || 0) + 1);
      });

      return Array.from(categoryMap.entries()).map(([name, count]) => ({
        name,
        count
      }));

    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  }

  // Transform database record to match BlogPost interface
  private transformRecord(record: any): BlogPostRecord {
    return {
      id: record.id,
      title: record.title,
      slug: record.slug,
      excerpt: record.excerpt || '',
      content: record.content,
      author: record.author,
      category: record.category,
      tags: record.tags || [],
      image: record.image || '',
      featured: record.featured || false,
      published: record.published || false,
      views: record.views || 0,
      seoTitle: record.seo_title || record.title,
      metaDescription: record.meta_description || record.excerpt,
      publishDate: record.publish_date,
      publishDate: record.publish_date || record.created_at,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    };
  }

  // Validate post data before saving
  validatePost(postData: BlogPostData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!postData.title || postData.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long');
    }

    if (!postData.excerpt || postData.excerpt.trim().length < 20) {
      errors.push('Excerpt must be at least 20 characters long');
    }

    if (!postData.content || postData.content.trim().length < 100) {
      errors.push('Content must be at least 100 characters long');
    }

    if (!postData.author || postData.author.trim().length < 2) {
      errors.push('Author name is required');
    }

    if (!postData.category || postData.category.trim().length < 2) {
      errors.push('Category is required');
    }

    if (!postData.tags || postData.tags.length === 0) {
      errors.push('At least one tag is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate read time estimate
  generateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }

  // Generate SEO-friendly slug
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}

export const blogDatabaseService = new BlogDatabaseService();