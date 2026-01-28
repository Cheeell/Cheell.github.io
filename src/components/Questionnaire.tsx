import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, Building, Users, DollarSign, Target, TrendingUp } from 'lucide-react';

interface QuestionnaireProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

export default function Questionnaire({ onComplete, onBack }: QuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    businessName: '',
    industry: '',
    customIndustry: '',
    businessType: '',
    regionOfOperation: '',
    businessUrl: '',
    targetAudience: '',
    currentRevenue: '',
    marketingBudget: '',
    marketingGoals: [],
    currentChallenges: [],
    competitorAnalysis: '',
    uniqueValue: '',
    currentMarketing: [],
    timeframe: ''
  });

  const questions = [
    {
      id: 'business-info',
      title: 'Tell us about your business',
      icon: Building,
      fields: [
        {
          name: 'businessName',
          label: 'Business Name',
          type: 'text',
          placeholder: 'Enter your business name',
          required: true
        },
        {
          name: 'industry',
          label: 'Industry',
          type: 'select',
          options: [
            'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 
            'Education', 'Real Estate', 'Food & Beverage', 'Professional Services', 'Other'
          ],
          required: true
        },
        {
          name: 'businessType',
          label: 'Business Type',
          type: 'select',
          options: ['B2B', 'B2C', 'Both'],
          required: true
        },
        {
          name: 'regionOfOperation',
          label: 'Region of Operation',
          type: 'text',
          placeholder: 'e.g., EU, France, Global, North America, etc.',
          required: true
        },
        {
          name: 'businessUrl',
          label: 'Business Website URL',
          type: 'text',
          placeholder: 'https://www.yourbusiness.com',
          required: false
        }
      ]
    },
    {
      id: 'audience',
      title: 'Who is your target audience?',
      icon: Users,
      fields: [
        {
          name: 'targetAudience',
          label: 'Describe your ideal customer',
          type: 'textarea',
          placeholder: 'e.g., Small business owners aged 25-45 who need accounting software...',
          required: true
        }
      ]
    },
    {
      id: 'budget',
      title: 'Budget & Revenue Information',
      icon: DollarSign,
      fields: [
        {
          name: 'currentRevenue',
          label: 'Current Annual Revenue',
          type: 'select',
          options: [
            'Pre-revenue', '$0 - $100K', '$100K - $500K', '$500K - $1M', 
            '$1M - $5M', '$5M - $10M', '$10M+'
          ],
          required: true
        },
        {
          name: 'marketingBudget',
          label: 'Monthly Marketing Budget',
          type: 'select',
          options: [
            'Less than $1K', '$1K - $5K', '$5K - $15K', '$15K - $50K', 
            '$50K - $100K', '$100K+'
          ],
          required: true
        }
      ]
    },
    {
      id: 'goals',
      title: 'Marketing Goals & Challenges',
      icon: Target,
      fields: [
        {
          name: 'marketingGoals',
          label: 'Primary Marketing Goals (select all that apply)',
          type: 'checkbox',
          options: [
            'Increase brand awareness',
            'Generate more leads',
            'Boost sales conversion',
            'Enter new markets',
            'Launch new products',
            'Improve customer retention',
            'Build online presence'
          ],
          required: true
        },
        {
          name: 'currentChallenges',
          label: 'Current Marketing Challenges (select all that apply)',
          type: 'checkbox',
          options: [
            'Limited budget',
            'Unclear target audience',
            'Low conversion rates',
            'Lack of marketing expertise',
            'Inconsistent messaging',
            'Poor online visibility',
            'Difficulty measuring ROI'
          ],
          required: true
        }
      ]
    },
    {
      id: 'competition',
      title: 'Market Position & Competition',
      icon: TrendingUp,
      fields: [
        {
          name: 'competitorAnalysis',
          label: 'Who are your main competitors?',
          type: 'textarea',
          placeholder: 'List 2-3 main competitors and what makes them successful...',
          required: true
        },
        {
          name: 'uniqueValue',
          label: 'What makes your business unique?',
          type: 'textarea',
          placeholder: 'Describe your unique value proposition...',
          required: true
        }
      ]
    },
    {
      id: 'current-marketing',
      title: 'Current Marketing & Timeline',
      icon: TrendingUp,
      fields: [
        {
          name: 'currentMarketing',
          label: 'Current Marketing Activities (select all that apply)',
          type: 'checkbox',
          options: [
            'Social media marketing',
            'Google Ads',
            'Content marketing',
            'Email marketing',
            'SEO',
            'Traditional advertising',
            'Networking events',
            'None of the above'
          ],
          required: true
        },
        {
          name: 'timeframe',
          label: 'When do you want to implement your strategy?',
          type: 'select',
          options: [
            'Immediately',
            'Within 1 month',
            'Within 3 months',
            'Within 6 months',
            'Just planning ahead'
          ],
          required: true
        }
      ]
    }
  ];

  const handleInputChange = (name: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // If industry is "Other", use the custom industry value
      const finalAnswers = { ...answers };
      if (answers.industry === 'Other' && answers.customIndustry) {
        finalAnswers.industry = answers.customIndustry;
      }
      onComplete(finalAnswers);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const isCurrentStepValid = () => {
    const currentQuestion = questions[currentStep];
    return currentQuestion.fields.every(field => {
      const value = answers[field.name as keyof typeof answers];
      if (!field.required) return true;
      if (field.type === 'checkbox') {
        return Array.isArray(value) && value.length > 0;
      }
      // Special validation for industry field when "Other" is selected
      if (field.name === 'industry' && value === 'Other') {
        return answers.customIndustry && answers.customIndustry.trim().length > 0;
      }
      return value && value.toString().trim().length > 0;
    });
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600 font-medium">
                Step {currentStep + 1} of {questions.length}
              </span>
              <span className="text-sm text-blue-600 font-semibold">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                <currentQuestion.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{currentQuestion.title}</h2>
            </div>
          </div>

          <div className="space-y-8 mb-10">
            {currentQuestion.fields.map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'text' && (
                  <input
                    type="text"
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm"
                    placeholder={field.placeholder}
                    value={answers[field.name as keyof typeof answers] as string || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                )}
                
                {field.type === 'textarea' && (
                  <textarea
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm resize-none"
                    rows={4}
                    placeholder={field.placeholder}
                    value={answers[field.name as keyof typeof answers] as string || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                )}
                
                {field.type === 'select' && (
                  <div>
                    <select
                      className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 shadow-sm"
                      value={answers[field.name as keyof typeof answers] as string || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((option, optionIndex) => (
                        <option key={optionIndex} value={option}>{option}</option>
                      ))}
                    </select>
                    
                    {/* Show custom input when "Other" is selected for industry */}
                    {field.name === 'industry' && answers.industry === 'Other' && (
                      <input
                        type="text"
                        className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm mt-3"
                        placeholder="Please specify your industry"
                        value={answers.customIndustry || ''}
                        onChange={(e) => handleInputChange('customIndustry', e.target.value)}
                      />
                    )}
                  </div>
                )}
                
                {field.type === 'checkbox' && (
                  <div className="space-y-2">
                    {field.options?.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          checked={(answers[field.name as keyof typeof answers] as string[] || []).includes(option)}
                          onChange={(e) => {
                            const currentValues = answers[field.name as keyof typeof answers] as string[] || [];
                            const newValues = e.target.checked
                              ? [...currentValues, option]
                              : currentValues.filter(v => v !== option);
                            handleInputChange(field.name, newValues);
                          }}
                        />
                        <span className="ml-4 text-gray-700 font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              className="flex items-center px-8 py-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {currentStep === 0 ? 'Back to Home' : 'Previous'}
            </button>
            
            <button
              onClick={handleNext}
              disabled={!isCurrentStepValid()}
              className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {currentStep === questions.length - 1 ? 'Generate Strategy' : 'Next'}
              {currentStep === questions.length - 1 ? 
                <CheckCircle className="w-5 h-5 ml-2" /> : 
                <ArrowRight className="w-5 h-5 ml-2" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}