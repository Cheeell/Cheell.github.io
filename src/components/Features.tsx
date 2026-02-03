import React from 'react';
import { Brain, FileText, Palette, Mail, Clock, Shield } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Our advanced AI analyzes your business model, industry, and goals to create personalized strategies.",
      color: "blue"
    },
    {
      icon: FileText,
      title: "Comprehensive Reports",
      description: "Get detailed marketing strategies with SWOT analysis, target audience insights, and action plans.",
      color: "green"
    },
    {
      icon: Palette,
      title: "Expert refinement ",
      description: "Strategy reviewed and refined by Marta Belya personally to ensure  each plan tailored to your unique business needs.",
      color: "purple"
    },
    {
      icon: Mail,
      title: "Instant Delivery",
      description: "Your custom marketing strategy is generated and delivered to your email within hour.",
      color: "orange"
    },
    {
      icon: Clock,
      title: "Save Time & Money",
      description: "Skip expensive consultants and months of research. Get strategic insights in just 7 days.",
      color: "pink"
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Your business information is encrypted and secure. We never share your data with third parties.",
      color: "indigo"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
      pink: "bg-pink-100 text-pink-600",
      indigo: "bg-indigo-100 text-indigo-600"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-6">
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Why Choose StrategyAI?
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Transform your marketing approach with AI-powered insights and professional deliverables
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-8 rounded-2xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg ${getColorClasses(feature.color)} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}