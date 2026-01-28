import React from 'react';
import { CheckCircle, AlertCircle, TrendingUp, Search, Eye } from 'lucide-react';
import BlogService from '../services/blogService';

interface BlogSEOOptimizerProps {
  post: {
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
    category: string;
    metaDescription: string;
  };
}

export default function BlogSEOOptimizer({ post }: BlogSEOOptimizerProps) {
  const seoAnalysis = BlogService.analyzeContentSEO({
    ...post,
    id: '',
    author: '',
    publishDate: '',
    readTime: '',
    image: '',
    views: 0,
    featured: false,
    seoTitle: post.title,
    slug: ''
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Search className="w-6 h-6 text-blue-600 mr-2" />
          SEO Analysis
        </h3>
        <div className={`px-4 py-2 rounded-full ${getScoreBgColor(seoAnalysis.score)}`}>
          <span className={`font-bold ${getScoreColor(seoAnalysis.score)}`}>
            {seoAnalysis.score}/100
          </span>
        </div>
      </div>

      {/* SEO Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Eye className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-semibold text-blue-900">Readability</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {BlogService.generateReadTime(post.content)}
          </div>
          <p className="text-sm text-blue-700">Estimated read time</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-semibold text-green-900">Keywords</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {post.tags.length}
          </div>
          <p className="text-sm text-green-700">Tags assigned</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Search className="w-5 h-5 text-purple-600 mr-2" />
            <span className="font-semibold text-purple-900">Content</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {post.content.split(/\s+/).length}
          </div>
          <p className="text-sm text-purple-700">Words</p>
        </div>
      </div>

      {/* SEO Suggestions */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">SEO Recommendations</h4>
        <div className="space-y-3">
          {seoAnalysis.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{suggestion}</span>
            </div>
          ))}
          
          {seoAnalysis.score >= 80 && (
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Great job! Your content is well-optimized for SEO.</span>
            </div>
          )}
        </div>
      </div>

      {/* Keyword Suggestions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Suggested Keywords for {post.category}</h4>
        <div className="flex flex-wrap gap-2">
          {BlogService.getCategoryKeywords(post.category).map((keyword, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}