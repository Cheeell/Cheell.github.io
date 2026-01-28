import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Save, 
  Eye, 
  ArrowLeft, 
  Type, 
  Calendar,
  Tag,
  User,
  Upload,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface BlogPostEditorProps {
  onBack: () => void;
  onSavePost: (post: any) => void;
}

// Mock blog database service for demonstration
const blogDatabaseService = {
  validatePost: (post: any) => ({
    isValid: post.title && post.content,
    errors: []
  }),
  createPost: async (post: any) => ({
    id: Date.now(),
    ...post,
    publishDate: new Date().toISOString(),
    views: 0,
    slug: post.title.toLowerCase().replace(/\s+/g, '-')
  }),
  generateReadTime: (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  }
};

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ onBack, onSavePost }) => {
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Form state
  const [postData, setPostData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Marketing',
    tags: '',
    author: '',
    featured: false,
    image: '',
    published: false
  });

  // Save post to database
  const savePost = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    setSaveError(null);

    try {
      // Convert tags string to array
      const tagsArray = postData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Prepare post data for database
      const blogPostData = {
        title: postData.title,
        excerpt: postData.excerpt,
        content: postData.content,
        author: postData.author,
        category: postData.category,
        tags: tagsArray,
        image: postData.image,
        featured: postData.featured,
        published: postData.published,
        seoTitle: postData.title,
        metaDescription: postData.excerpt.substring(0, 160)
      };

      // Validate post data
      const validation = blogDatabaseService.validatePost(blogPostData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Save to database
      const savedPost = await blogDatabaseService.createPost(blogPostData);
      
      if (!savedPost) {
        throw new Error('Failed to save post to database');
      }

      console.log('Post saved successfully:', savedPost.id);
      setSaveStatus('success');
      
      // Convert to format expected by parent component
      const postForParent = {
        id: savedPost.id,
        title: savedPost.title,
        excerpt: savedPost.excerpt,
        content: savedPost.content,
        author: savedPost.author,
        publishDate: new Date(savedPost.publishDate).toISOString().split('T')[0],
        readTime: blogDatabaseService.generateReadTime(savedPost.content),
        category: savedPost.category,
        tags: savedPost.tags,
        image: savedPost.image || 'https://images.pexels.com/photos/267389/pexels-photo-267389.jpeg?auto=compress&cs=tinysrgb&w=800',
        views: savedPost.views,
        featured: savedPost.featured,
        published: savedPost.published,
        seoTitle: savedPost.seoTitle,
        metaDescription: savedPost.metaDescription,
        slug: savedPost.slug
      };

      console.log('Post saved successfully, notifying parent component:', postForParent);
      
      // Notify parent component
      onSavePost(postForParent);
      
      // Show success message briefly then redirect
      setTimeout(() => {
        onBack();
      }, 1500);

    } catch (error) {
      console.error('Error saving post:', error);
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  // Content formatting helpers
  const formatText = (format: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
      let formattedText = selectedText;
      switch (format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'heading':
          formattedText = `## ${selectedText}`;
          break;
        case 'list':
          formattedText = selectedText.split('\n').map(line => line ? `• ${line}` : line).join('\n');
          break;
        case 'numbered':
          formattedText = selectedText.split('\n').map((line, i) => line ? `${i + 1}. ${line}` : line).join('\n');
          break;
      }
      
      const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      setPostData({...postData, content: newContent});
    }
  };

  const insertTemplate = (template: string) => {
    let templateText = '';
    switch (template) {
      case 'intro':
        templateText = `## Introduction

Write your introduction here. This should grab the reader's attention and explain what they'll learn from this article.

`;
        break;
      case 'tips':
        templateText = `## Top Tips

Here are some practical tips:

• **Tip 1**: Your first tip here
• **Tip 2**: Your second tip here  
• **Tip 3**: Your third tip here

`;
        break;
      case 'conclusion':
        templateText = `## Conclusion

Summarize the key points from your article and provide a clear call-to-action for your readers.

`;
        break;
    }
    
    setPostData({...postData, content: postData.content + templateText});
  };

  const handleInputChange = (field: string, value: any) => {
    setPostData({...postData, [field]: value});
  };

  const convertToHTML = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^• (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/<\/ul>\s*<ul>/g, '')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[h|u])/gm, '<p>')
      .replace(/(?<!>)$/gm, '</p>');
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Editor
            </button>
            <span className="text-sm text-gray-500">Preview Mode</span>
          </div>
        </div>

        <article className="max-w-4xl mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {postData.category}
              </span>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date().toLocaleDateString()}
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {postData.title || 'Your Blog Post Title'}
            </h1>
            
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                {(postData.author || 'A').charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{postData.author || 'Author Name'}</p>
                <p className="text-sm text-gray-600">Marketing Strategist</p>
              </div>
            </div>
          </header>

          {postData.image && (
            <div className="mb-8">
              <img
                src={postData.image}
                alt={postData.title}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: convertToHTML(postData.content) }} />
          </div>

          {postData.tags && (
            <footer className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {postData.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </footer>
          )}
        </article>
      </div>
    );
  }

  if (!showEditor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Type className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create Your Blog Post
          </h1>
          
          <p className="text-gray-600 mb-8 text-lg">
            Our easy-to-use editor helps you write professional blog posts without any technical knowledge. 
            Just focus on your content - we'll handle the rest!
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📝 Easy Writing</h3>
              <p className="text-sm text-blue-700">Simple text editor with formatting buttons</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">🎨 Professional Design</h3>
              <p className="text-sm text-purple-700">Beautiful layouts automatically applied</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">👀 Live Preview</h3>
              <p className="text-sm text-green-700">See exactly how your post will look</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowEditor(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Start Writing Your Post
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Write New Post</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors px-4 py-2 border border-blue-200 rounded-lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={savePost}
                disabled={isSaving || !postData.title.trim() || !postData.content.trim()}
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Status Messages */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-green-800 font-medium">
              Post saved successfully! Redirecting to blog...
            </span>
          </div>
        </div>
      )}

      {saveStatus === 'error' && saveError && (
        <div className="bg-red-50 border border-red-200 p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <span className="text-red-800 font-medium">Error saving post:</span>
              <p className="text-red-700 text-sm mt-1">{saveError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Post Details */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Post Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your blog post title..."
                      value={postData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description
                    </label>
                    <textarea
                      placeholder="Brief description of your post (appears in previews)..."
                      value={postData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={postData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Marketing">Marketing</option>
                        <option value="SEO">SEO</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Content Strategy">Content Strategy</option>
                        <option value="Email Marketing">Email Marketing</option>
                        <option value="Analytics">Analytics</option>
                        <option value="Tips & Tricks">Tips & Tricks</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Author Name
                      </label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={postData.author}
                        onChange={(e) => handleInputChange('author', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (separate with commas)
                    </label>
                    <input
                      type="text"
                      placeholder="marketing, tips, strategy, growth"
                      value={postData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Featured Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/your-image.jpg"
                      value={postData.image}
                      onChange={(e) => handleInputChange('image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: Use free images from Unsplash, Pexels, or Pixabay
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="publishStatus"
                        checked={!postData.published}
                        onChange={() => handleInputChange('published', false)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Save as draft</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="publishStatus"
                        checked={postData.published}
                        onChange={() => handleInputChange('published', true)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Validation Messages */}
              {postData.title && postData.content && (
                <div className="px-6 py-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center text-green-800 text-sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Post is ready to save
                    </div>
                  </div>
                </div>
              )}

              {(!postData.title.trim() || !postData.content.trim()) && (
                <div className="px-6 py-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center text-yellow-800 text-sm">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Title and content are required to save
                    </div>
                  </div>
                </div>
              )}

              {/* Content Editor */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Write Your Content</h2>
                  <div className="text-sm text-gray-500">
                    {postData.content.length} characters • {blogDatabaseService.generateReadTime(postData.content)}
                  </div>
                </div>

                {/* Formatting Toolbar */}
                <div className="border border-gray-200 rounded-lg mb-4">
                  <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
                    <button
                      onClick={() => formatText('bold')}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => formatText('italic')}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => formatText('heading')}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Heading"
                    >
                      <Type className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 mx-2" />
                    <button
                      onClick={() => formatText('list')}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => formatText('numbered')}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>
                  </div>

                  <textarea
                    id="content-editor"
                    placeholder="Start writing your blog post here...

You can use simple formatting:
**bold text** for bold
*italic text* for italics
## Heading for sections

Select text and use the buttons above for easy formatting!"
                    value={postData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className="w-full p-4 border-0 resize-none focus:ring-0 focus:outline-none"
                    rows={20}
                  />
                </div>

                {/* Quick Templates */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Quick Insert Templates</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => insertTemplate('intro')}
                      className="bg-white text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors"
                    >
                      + Introduction Section
                    </button>
                    <button
                      onClick={() => insertTemplate('tips')}
                      className="bg-white text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors"
                    >
                      + Tips List
                    </button>
                    <button
                      onClick={() => insertTemplate('conclusion')}
                      className="bg-white text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors"
                    >
                      + Conclusion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Publishing Options</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={postData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Mark as featured post (appears in highlights)
                  </label>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={savePost}
                    disabled={isSaving || !postData.title.trim() || !postData.content.trim()}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Saving to Database...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {postData.published ? 'Publish Post' : 'Save Draft'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Writing Tips</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-2 mt-0.5">1</span>
                  Start with a compelling headline that grabs attention
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-2 mt-0.5">2</span>
                  Write a clear introduction explaining what readers will learn
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-2 mt-0.5">3</span>
                  Break up content with headings and bullet points
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-2 mt-0.5">4</span>
                  End with actionable takeaways or next steps
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Formatting Guide</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-gray-900">**Bold Text**</div>
                  <div className="text-gray-600">Becomes: <strong>Bold Text</strong></div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">*Italic Text*</div>
                  <div className="text-gray-600">Becomes: <em>Italic Text</em></div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">## Heading</div>
                  <div className="text-gray-600">Creates a section heading</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">• List item</div>
                  <div className="text-gray-600">Creates bullet points</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostEditor;