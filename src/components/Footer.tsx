import React from 'react';
import { Zap, Mail, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">StrategyAI</span>
            </div>
            <p className="text-gray-300 mb-8 max-w-md leading-relaxed text-lg">
              Transform your marketing approach with AI-powered insights. Get personalized strategies that actually work DIma frog.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-300">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Features</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Pricing</a></li>
              <li><a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">How it works</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"></a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">About</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Blog</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Careers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            Developed by Maksym Belia
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy.html" className="text-gray-300 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="/terms.html" className="text-gray-300 hover:text-white text-sm transition-colors">Terms & Conditions</a>
            <a href="/cookie.html" className="text-gray-300 hover:text-white text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}