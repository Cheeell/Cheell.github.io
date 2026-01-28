import React from 'react';
import { Check, X, Zap, TrendingUp, Users, Clock, Shield, Star } from 'lucide-react';
import { PAYMENT_CONFIG, isPaymentRequired, getPaymentPrice, getPaymentMode } from '../config/paymentConfig';

interface PricingProps {
  onGetStarted: () => void;
}

export default function Pricing({ onGetStarted }: PricingProps) {
  const features = [
    'Comprehensive marketing strategy',
    'Target audience analysis',
    'SWOT analysis',
    'Channel recommendations',
    'Budget allocation guide',
    'Implementation timeline',
    'KPI framework',
    'Competitive positioning',
    'Risk mitigation plan',
    'Next steps action plan',
    'Professional PDF report',
    'Email delivery'
  ];

  const comparison = [
    {
      feature: 'Strategy Development',
      agency: 'Basic framework',
      us: 'Comprehensive & detailed'
    },
    {
      feature: 'Delivery Time',
      agency: '2-4 weeks',
      us: '1 hour'
    },
    {
      feature: 'Revisions',
      agency: 'Limited (1-2)',
      us: 'Unlimited access'
    },
    {
      feature: 'Implementation Support',
      agency: 'Additional cost',
      us: 'Included in strategy'
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-sm font-semibold mb-6 shadow-sm border border-green-200/50">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Professional Strategy,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              Affordable Price
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Most marketing agencies charge between <span className="font-semibold text-red-600">£500 and £2,500</span> for a strategy in Europe and the UK — and that's often just the starting point.
          </p>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
            We believe great strategy shouldn't be a luxury. That's why we offer a professional, tailored marketing strategy for just <span className="font-bold text-green-600">£50</span>, giving small and growing businesses the clarity they need without the high price tag.
          </p>
        </div>

        {/* Price Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Traditional Agencies */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 relative">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Traditional Agencies</h3>
              <div className="text-4xl font-bold text-red-600 mb-2">£500 - £2,500</div>
              <p className="text-gray-600">+ additional costs</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span>2-4 weeks delivery</span>
              </li>
              <li className="flex items-center text-gray-600">
                <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span>Limited revisions</span>
              </li>
              <li className="flex items-center text-gray-600">
                <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span>Generic frameworks</span>
              </li>
              <li className="flex items-center text-gray-600">
                <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span>Extra costs for changes</span>
              </li>
            </ul>
            <div className="absolute top-4 right-4 bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
              Expensive
            </div>
          </div>

          {/* Our Service - Featured */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 shadow-2xl border-2 border-green-200 relative transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
              Best Value
            </div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">StrategyAI</h3>
              <div className="text-5xl font-bold text-green-600 mb-2">£50</div>
              <p className="text-gray-600">One-time payment</p>
            </div>
            
            {/* Payment status indicator */}
            {!isPaymentRequired() && (
              <div className="mb-4">
                <div className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium">
                  {getPaymentMode() === 'free-trial' ? '🎉 Free Trial Available' : 
                   getPaymentMode() === 'testing' ? '🧪 Testing Mode' : 
                   '🆓 Payment Disabled'}
                </div>
              </div>
            )}
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>1 hour delivery</span>
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>Unlimited access</span>
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>Personalized strategy</span>
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>Expert review included</span>
              </li>
            </ul>
            <button 
              onClick={onGetStarted}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {isPaymentRequired() ? 'Get Your Strategy Now' : 'Get Free Strategy Now'}
            </button>
          </div>

          {/* DIY Approach */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 relative">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">DIY Approach</h3>
              <div className="text-4xl font-bold text-gray-600 mb-2">Free</div>
              <p className="text-gray-600">But costs time & expertise</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                <span>Weeks of research</span>
              </li>
              <li className="flex items-center text-gray-600">
                <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span>No expert guidance</span>
              </li>
              <li className="flex items-center text-gray-600">
                <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span>Risk of mistakes</span>
              </li>
              <li className="flex items-center text-gray-600">
                <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span>Opportunity cost</span>
              </li>
            </ul>
            <div className="absolute top-4 right-4 bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full">
              Time-consuming
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="bg-white rounded-2xl p-10 shadow-2xl border border-gray-100 mb-16">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">What's Included in Your £50 Strategy</h3>
            <p className="text-lg text-gray-600">Everything you need to transform your marketing approach</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Detailed Comparison</h3>
            <p className="text-blue-100">See how we stack up against traditional agencies</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Traditional Agencies</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-green-700 bg-green-50">StrategyAI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparison.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.feature}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">{item.agency}</td>
                    <td className="px-6 py-4 text-sm text-green-700 text-center font-medium bg-green-50">{item.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="">
              </div>
              <h4 className=""></h4>
              <p className=""></p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Instant Delivery</h4>
              <p className="text-sm text-gray-600">Get your strategy within 1 hour</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Expert Reviewed</h4>
              <p className="text-sm text-gray-600">Every strategy reviewed by Marta</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">4.9/5 Rating</h4>
              <p className="text-sm text-gray-600">Loved by 2,000+ businesses</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}