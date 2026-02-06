import React from 'react';
import { MessageSquare, Brain, FileText, Mail } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: MessageSquare,
      title: "Answer Questions",
      description: "Tell us about your business, goals, target audience, and current marketing efforts through our smart questionnaire.",
      color: "blue"
    },
    {
      number: 2,
      icon: Brain,
      title: "AI Analysis",
      description: "Our advanced AI analyzes your responses and generates a comprehensive marketing strategy tailored to your business.",
      color: "green"
    },
    {
      number: 3,
      icon: FileText,
      title: "Beautiful Design",
      description: "Your strategy is automatically formatted into a professionally designed PDF with visual elements and charts.",
      color: "purple"
    },
    {
      number: 4,
      icon: Mail,
      title: "Instant Delivery",
      description: "Receive your custom marketing strategy in your inbox within days, ready to implement or share.",
      color: "orange"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/30 rounded-full blur-2xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 relative">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold mb-6">
            <span>Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Get your custom marketing strategy in just 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-orange-200"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 border-4 border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:scale-110">
                  <step.icon className="w-12 h-12 text-blue-600" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {step.number}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center relative">
          <div className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 text-sm font-semibold shadow-lg border border-blue-200/50">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="bg-gradient-to-r from-blue-700 to-green-700 bg-clip-text text-transparent">Average completion time: 1 hour</span>
          </div>
        </div>
      </div>
    </section>
  );
}