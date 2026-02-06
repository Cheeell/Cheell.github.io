import React from 'react';
import { ArrowRight, CheckCircle, TrendingUp, Users, Target } from 'lucide-react';
import { isPaymentRequired, getPaymentMode } from '../config/paymentConfig';

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="pt-28 pb-20 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto relative">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold mb-8 shadow-sm border border-blue-200/50">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span className="bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">90% of startups fail due to poor marketing strategy</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
            Get Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 relative">
              Custom Marketing Strategy
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-lg -z-10"></div>
            </span>
            {' '}from expert
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Stop guessing with your marketing. Our AI-powered tool analyzes your business and creates a personalized marketing strategy tailored to your needs - delivered as a beautiful PDF report.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center group shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              Create My Strategy Now
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
            <div className="flex items-center text-gray-600 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-200/50">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="font-medium">
                {isPaymentRequired() 
                  ? 'Fast • 1 hour • Secure payment' 
                  : getPaymentMode() === 'free-trial'
                  ? 'Free Trial • 1 hour • No credit card required'
                  : 'Free • 1 hour • No payment required'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-blue-200/50">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Target Audience Analysis</h3>
              <p className="text-gray-600 leading-relaxed">Identify and understand your ideal customers with precision</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-green-200/50">
                <Target className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Channel Strategy</h3>
              <p className="text-gray-600 leading-relaxed">Discover the best marketing channels for your business</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-purple-200/50">
                <TrendingUp className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Growth Roadmap</h3>
              <p className="text-gray-600 leading-relaxed">Step-by-step plan to scale your marketing effectively</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}