import React from 'react';
import { Menu, X, Zap, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isPaymentRequired } from '../config/paymentConfig';

interface HeaderProps {
  onGetStarted?: () => void;
  onBlogClick?: () => void;
}

export default function Header({ onGetStarted, onBlogClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Strategy AI Dima frog</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium relative group">
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium relative group">
              Success Stories
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </a>
            <button 
              onClick={() => onBlogClick?.()}
              className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium relative group"
            >
              Blog
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => onGetStarted?.()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center group"
            >
              {isPaymentRequired() ? 'Get Started' : 'Get Strategy'}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </nav>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            <a href="#features" className="block px-3 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">Features</a>
            <a href="#how-it-works" className="block px-3 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">How It Works</a>
            <a href="#pricing" className="block px-3 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">Pricing</a>
            <a href="#testimonials" className="block px-3 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">Success Stories</a>
            <button 
              onClick={() => onBlogClick?.()}
              className="block w-full text-left px-3 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              Blog
            </button>
            <button 
              onClick={() => onGetStarted?.()}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
            >
              {isPaymentRequired() ? 'Get Started' : 'Get Free Strategy'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}