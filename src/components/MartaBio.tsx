import React from 'react';
import { Award, BookOpen, Users, TrendingUp, CheckCircle, Star } from 'lucide-react';

export default function MartaBio() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/20 rounded-full blur-2xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold mb-6 shadow-sm border border-blue-200/50">
            <Award className="w-4 h-4 mr-2" />
            <span>Meet Your Strategist</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Marta Belya
          </h2>
          <p className="text-xl text-blue-600 font-semibold mb-4">
            Marketing Project Manager | Digital Strategist | Author of "TOP 90 Marketing Frameworks"
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Photo and credentials */}
          <div className="text-center lg:text-left">
            <div className="relative inline-block mb-8">
              <div className="w-80 h-80 mx-auto lg:mx-0 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 shadow-2xl border-4 border-white overflow-hidden relative">
                <img 
                  src="/telegram-cloud-photo-size-2-5454404528444143273-y.jpg"
                  alt="Marta Belya - Marketing Strategist"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
              </div>
              {/* Floating achievement badges */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="text-center p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="text-2xl font-bold text-blue-600">10+</div>
                <div className="text-sm text-gray-600 font-medium">Years Experience</div>
              </div>
              <div className="text-center p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="text-2xl font-bold text-green-600">500+</div>
                <div className="text-sm text-gray-600 font-medium">Strategies Created</div>
              </div>
              <div className="text-center p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="text-2xl font-bold text-purple-600">90</div>
                <div className="text-sm text-gray-600 font-medium">Frameworks</div>
              </div>
            </div>
          </div>

          {/* Right side - Bio content */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Marta Belya is a results-driven Marketing Project Manager and Digital Marketing Strategist with over 
                <span className="font-semibold text-blue-600"> 10 years of experience</span> helping startups, scaleups, 
                and enterprise brands unlock growth through intelligent, actionable marketing strategies.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Marta is the visionary behind the <span className="font-semibold text-purple-600">Strategy AI platform</span>—a 
                tool that merges AI-powered insights with her personal strategic expertise. Every strategy delivered through 
                the platform is <span className="font-semibold text-green-600"></span> to 
                ensure clients receive not only a smart plan, but one that is deeply aligned with their goals and market realities.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed">
                With a sharp eye for growth opportunities and a commitment to practical, high-impact execution, Marta helps 
                businesses turn <span className="font-semibold text-indigo-600">complexity into clarity—and strategy into success</span>.
              </p>
            </div>

            {/* Expertise areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="font-bold text-blue-900">Growth Strategy</h3>
                </div>
                <p className="text-blue-700 text-sm">Scaling startups and enterprises through data-driven marketing approaches</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center mb-3">
                  <Users className="w-6 h-6 text-purple-600 mr-3" />
                  <h3 className="font-bold text-purple-900">Team Leadership</h3>
                </div>
                <p className="text-purple-700 text-sm">Managing cross-functional teams and complex marketing projects</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center mb-3">
                  <BookOpen className="w-6 h-6 text-green-600 mr-3" />
                  <h3 className="font-bold text-green-900">Framework Development</h3>
                </div>
                <p className="text-green-700 text-sm">Author of "TOP 90 Marketing Frameworks" - proven methodologies</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-6 h-6 text-orange-600 mr-3" />
                  <h3 className="font-bold text-orange-900">Results-Driven</h3>
                </div>
                <p className="text-orange-700 text-sm">Focus on measurable outcomes and ROI-positive strategies</p>
              </div>
            </div>

            {/* Personal touch */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center mb-4">
                  <Star className="w-6 h-6 text-yellow-300 mr-2" />
                  <h3 className="text-xl font-bold">Personal Commitment</h3>
                </div>
                <p className="text-blue-100 leading-relaxed">
                  "Every strategy that goes through our platform gets my personal review. I believe in combining 
                  AI efficiency with human insight to deliver strategies that actually work in the real world."
                </p>
                <div className="mt-4 text-right">
                  <span className="text-blue-200 font-medium">— Marta Belya</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}