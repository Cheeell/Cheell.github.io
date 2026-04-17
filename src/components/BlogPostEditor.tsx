import React, { useState } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Save,
  Eye,
  ArrowLeft,
  Type,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader,
  EyeOff
} from 'lucide-react';
import { blogDatabaseService } from '../services/blogDatabaseService';

interface BlogPostEditorProps {
  onBack: () => void;
  onSavePost: (post: any) => void;
}

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ onBack, onSavePost }) => {
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

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

  // Save post using the REAL Supabase blogDatabaseService
  const savePost = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    setSaveError(null);

    try {
      const tagsArray = postData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const blogPostData = {
        title: postData.title,
        excerpt: postData.excerpt,
        content: postData.content,
        author: postData.author,
        category: postData.category,
        tags: tagsArray,
        image: postData.image || undefined,
        featured: postData.featured,
        published: postData.published,
        seoTitle: postData.title,
        metaDescription: postData.excerpt.substring(0, 160)
      };

      // Validate using the real service
      const validation = blogDatabaseService.validatePost(blogPostData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('\n'));
      }

      // Save to Supabase via the real service
      const savedPost = await blogDatabaseService.createPost(blogPostData);

      if (!savedPost) {
        throw new Error('Failed to save post — Supabase returned null. Check your RLS policies and table permissions.');
      }

      console.log('Post saved to Supabase successfully:', savedPost.id);
      setSaveStatus('success');

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

      onSavePost(postForParent);

      setTimeout(() => {
        onBack();
      }, 1500);

    } catch (error) {
      console.error('Error saving post to Supabase:', error);
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Unknown error saving post');
    } finally {
      setIsSaving(false);
    }
  };

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
      setPostData({ ...postData, content: newContent });
    }
  };

  const insertTemplate = (template: string) => {
    let templateText = '';
    switch (template) {
      case 'intro':
        templateText = `## Introduction\n\nWrite your introduction here.\n\n`;
        break;
      case 'tips':
        templateText = `## Top Tips\n\n• **Tip 1**: Your first tip here\n• **Tip 2**: Your second tip here\n• **Tip 3**: Your third tip here\n\n`;
        break;
      case 'conclusion':
        templateText = `## Conclusion\n\nSummarize the key points and provide a clear call-to-action.\n\n`;
        break;
    }
    setPostData({ ...postData, content: postData.content + templateText });
  };

  const handleInputChange = (field: string, value: any) => {
    setPostData({ ...postData, [field]: value });
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

  // ─── Preview mode ─────────────────────────────────────────────────────────
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
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{postData.category}</span>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date().toLocaleDateString()}
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{postData.title || 'Your Blog Post Title'}</h1>
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
              <img src={postData.image} alt={postData.title} className="w-full h-64 object-cover rounded-lg shadow-lg" />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: convertToHTML(postData.content) }} />
          </div>

          {postData.tags && (
            <footer className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {postData.tags.split(',').map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
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

  // ─── Welcome / intro screen ───────────────────────────────────────────────
  if (!showEditor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Type className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Your Blog Post</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Write and publish directly to Supabase. Posts appear on your blog instantly.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📝 Easy Writing</h3>
              <p className="text-sm text-blue-700">Simple editor with formatting toolbar</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">☁️ Real Database</h3>
              <p className="text-sm text-purple-700">Saves directly to Supabase</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">👀 Live Preview</h3>
              <p className="text-sm text-green-700">See how your post will look</p>
            </div>
          </div>
          <button
            onClick={() => setShowEditor(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Start Writing
          </button>
        </div>
      </div>
    );
  }

  // ─── Main editor ──────────────────────────────────────────────────────────
  const isFormValid = postData.title.trim().length >= 5 && postData.content.trim().length >= 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800 mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Write New Post</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center text-blue-600 hover:text-blue-800 px-4 py-2 border border-blue-200 rounded-lg transition-colors"
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={savePost}
                disabled={isSaving || !isFormValid}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Saving to Supabase...
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
      </div>

      {/* Status banners */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border-b border-green-200 p-4">
          <div className="flex items-center max-w-7xl mx-auto">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-green-800 font-medium">
              Post saved to Supabase! Redirecting...
            </span>
          </div>
        </div>
      )}

      {saveStatus === 'error' && saveError && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="flex items-start max-w-7xl mx-auto">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-red-800 font-medium">Error saving to Supabase:</span>
              <pre className="text-red-700 text-sm mt-1 whitespace-pre-wrap">{saveError}</pre>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* Main Editor */}
          <div className="lg:col-span-3 space-y-6">
            {/* Post Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Post Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post Title <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-2">(min. 5 chars)</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description / Excerpt
                    <span className="text-gray-400 font-normal ml-2">(min. 20 chars for validation)</span>
                  </label>
                  <textarea
                    placeholder="Brief description shown in previews and used as meta description..."
                    value={postData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={postData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>Marketing</option>
                      <option>SEO</option>
                      <option>Social Media</option>
                      <option>Content Strategy</option>
                      <option>Email Marketing</option>
                      <option>Analytics</option>
                      <option>Tips & Tricks</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author Name <span className="text-red-500">*</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags <span className="text-gray-400 font-normal">(comma-separated, at least 1 required)</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={postData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Free images: Unsplash, Pexels, Pixabay</p>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="publishStatus"
                      checked={!postData.published}
                      onChange={() => handleInputChange('published', false)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Save as draft</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
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

            {/* Content Editor */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Content</h2>
                  <span className="text-sm text-gray-500">
                    {postData.content.split(/\s+/).filter(Boolean).length} words
                    {postData.content.trim().length < 100 && (
                      <span className="text-amber-600 ml-2">(min. 100 chars required)</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50">
                <button onClick={() => formatText('bold')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Bold (**text**)">
                  <Bold className="w-4 h-4" />
                </button>
                <button onClick={() => formatText('italic')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Italic (*text*)">
                  <Italic className="w-4 h-4" />
                </button>
                <button onClick={() => formatText('heading')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Heading (## text)">
                  <Type className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <button onClick={() => formatText('list')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Bullet list">
                  <List className="w-4 h-4" />
                </button>
                <button onClick={() => formatText('numbered')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Numbered list">
                  <ListOrdered className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <button onClick={() => insertTemplate('intro')} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">+ Intro</button>
                <button onClick={() => insertTemplate('tips')} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">+ Tips</button>
                <button onClick={() => insertTemplate('conclusion')} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">+ Conclusion</button>
              </div>

              <textarea
                id="content-editor"
                placeholder={`Start writing your blog post here...\n\nFormatting:\n**bold text**\n*italic text*\n## Section heading\n• bullet point`}
                value={postData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="w-full p-4 border-0 resize-none focus:ring-0 focus:outline-none font-mono text-sm leading-relaxed"
                rows={22}
              />
            </div>

            {/* Validation summary */}
            {saveStatus === 'idle' && (
              <div className={`rounded-lg p-3 border text-sm flex items-start gap-2 ${isFormValid ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                {isFormValid
                  ? <><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> Post is ready to save to Supabase</>
                  : <><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> Title (5+ chars) and content (100+ chars) are required</>
                }
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Publishing</h3>
              <div className="space-y-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={postData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded mt-0.5"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mark as featured post</span>
                </label>

                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-3 bg-gray-50 rounded p-2">
                    <p className="font-medium text-gray-700 mb-1">💾 Saves to Supabase</p>
                    <p>Uses the real <code>blogDatabaseService.createPost()</code> — not a mock.</p>
                  </div>
                  <button
                    onClick={savePost}
                    disabled={isSaving || !isFormValid}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium"
                  >
                    {isSaving ? (
                      <><Loader className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />{postData.published ? 'Publish Post' : 'Save Draft'}</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Formatting Guide</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div><code className="bg-gray-100 px-1 rounded">**text**</code> → <strong>bold</strong></div>
                <div><code className="bg-gray-100 px-1 rounded">*text*</code> → <em>italic</em></div>
                <div><code className="bg-gray-100 px-1 rounded">## Heading</code> → section title</div>
                <div><code className="bg-gray-100 px-1 rounded">• item</code> → bullet point</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Writing Tips</h3>
              <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                <li>Start with a compelling headline</li>
                <li>Write a clear intro explaining what readers learn</li>
                <li>Use headings to break up content</li>
                <li>End with clear actionable takeaways</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostEditor;