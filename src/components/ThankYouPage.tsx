import React, { useState, useEffect } from 'react';
import { CheckCircle, Mail, Loader, ArrowRight, Shield, Award, Star, AlertCircle } from 'lucide-react';
import { sendStrategyEmail } from '../services/emailService';
import { supabaseStorageService } from '../services/supabaseStorageService';
import { generateMarketingStrategyWithWebSearch } from '../services/openaiService';
import PDFService from '../services/pdfService';

interface ThankYouPageProps {
  businessData: any;
  paymentData?: any;
  onStartOver: () => void;
}

export default function ThankYouPage({ businessData, paymentData, onStartOver }: ThankYouPageProps) {
  const [email, setEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [strategy, setStrategy] = useState<any>(null);

  // Pre-fill email from payment data
  useEffect(() => {
    const emailToUse = paymentData?.email || 
                       businessData?.email || 
                       localStorage.getItem('pendingPaymentEmail') ||
                       '';
    if (emailToUse) {
      setEmail(emailToUse);
    }
  }, [businessData, paymentData]);

  const generateAndSendStrategy = async () => {
    if (!email.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    try {
      // Update email status to show strategy generation started
      await supabaseStorageService.updateEmailStatus(email, {
        paymentStatus: 'completed',
        strategyGenerated: false,
        emailSent: false
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 80));
      }, 500);

      console.log('Starting strategy generation for:', businessData.businessName);
      
      // Generate strategy using AI
      const response = await generateMarketingStrategyWithWebSearch(businessData);
      
      clearInterval(progressInterval);
      setGenerationProgress(90);
      
      setStrategy(response);
      
      console.log('Strategy generated, now creating PDF and sending email...');
      setGenerationProgress(95);
      
      // Generate PDF from strategy
      const pdfBase64 = await PDFService.generatePDFFromChatGPT(
        businessData,
        response.content,
        { includeCharts: true, includeVisuals: true }
      );
      
      setGenerationProgress(100);
      setIsGenerating(false);
      setIsEmailSending(true);
      
      // Send email with PDF attachment
      await sendStrategyEmail(
        email,
        businessData,
        response.content,
        {
          filename: `${businessData.businessName || 'Business'}_Marketing_Strategy.pdf`,
          content: pdfBase64,
          type: 'application/pdf'
        }
      );
      
      // Update email status
      await supabaseStorageService.updateEmailStatus(email, {
        strategyGenerated: true,
        emailSent: true
      });
      
      setEmailSent(true);
      setIsEmailSending(false);
      
      // Clear localStorage
      localStorage.removeItem('pendingPaymentEmail');
      localStorage.removeItem('pendingBusinessData');
      
      console.log('✅ Strategy generated and sent successfully');
      
    } catch (error) {
      console.error('Error generating and sending strategy:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate and send strategy');
      setIsGenerating(false);
      setIsEmailSending(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Strategy Delivered Successfully! 🎉
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Your comprehensive marketing strategy has been sent to <span className="font-semibold text-green-600">{email}</span>
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-green-900 mb-3">What's in your inbox:</h3>
              <ul className="text-green-800 text-left space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  Complete marketing strategy analysis
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  Professional PDF report (ready to share)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  Implementation timeline and action steps
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  Budget allocation and KPI framework
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={onStartOver}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Create Another Strategy
              </button>
              
              <p className="text-sm text-gray-500">
                Need help implementing your strategy? Reply to the email and we'll assist you!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating || isEmailSending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Loader className="w-10 h-10 text-white animate-spin" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {isGenerating ? 'Generating Your Strategy...' : 'Sending to Your Email...'}
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {isGenerating 
                ? `Our AI is analyzing your business and creating a personalized marketing strategy for ${businessData.businessName}.`
                : `Sending your complete strategy report to ${email}...`
              }
            </p>
            
            {isGenerating && (
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-100 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Generation Progress</span>
                  <span className="text-sm text-blue-600">{generationProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {generationProgress < 30 && "Analyzing your business model..."}
                  {generationProgress >= 30 && generationProgress < 60 && "Researching your industry..."}
                  {generationProgress >= 60 && generationProgress < 90 && "Generating strategic recommendations..."}
                  {generationProgress >= 90 && "Creating professional PDF report..."}
                </div>
              </div>
            )}
            
            {isEmailSending && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-900">Sending Email</span>
                </div>
                <p className="text-blue-800 text-sm">
                  Your strategy is being delivered to {email} with PDF attachment
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Thank You for Your Purchase! 🎉
            </h1>
            
            <p className="text-xl text-gray-600 mb-2 leading-relaxed">
              Your payment has been confirmed for <span className="font-semibold text-green-600">{businessData.businessName}</span>
            </p>
            
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
              <CheckCircle className="w-4 h-4 mr-2" />
              Payment Successful - £50.00
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-blue-900">Secure</div>
              <div className="text-xs text-blue-700">256-bit SSL</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
              <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-purple-900">Expert</div>
              <div className="text-xs text-purple-700">AI + Human</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
              <Star className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-orange-900">Rated</div>
              <div className="text-xs text-orange-700">4.9/5 Stars</div>
            </div>
          </div>

          {/* Email Confirmation Form */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Confirm Your Email to Receive Your Strategy
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              We'll generate and send your comprehensive marketing strategy to this email address
            </p>
            
            <form onSubmit={(e) => { e.preventDefault(); generateAndSendStrategy(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your strategy will be delivered as a professional PDF report
                </p>
              </div>
              
              <button
                type="submit"
                disabled={!email.trim() || isGenerating || isEmailSending}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center"
              >
                <Mail className="w-5 h-5 mr-3" />
                Generate & Send My Strategy
                <ArrowRight className="w-5 h-5 ml-3" />
              </button>
            </form>
          </div>

          {/* What You'll Receive */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
            <h3 className="font-bold text-gray-900 mb-4 text-center">What You'll Receive</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">Comprehensive market analysis</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">Target audience insights</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">SWOT & competitive analysis</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">Implementation roadmap</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">Budget allocation guide</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">Professional PDF report</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <span className="text-red-800 font-medium">Error:</span>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Questions? Reply to your strategy email and we'll help you implement it!
            </p>
            
            <button
              onClick={onStartOver}
              className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
            >
              Create another strategy →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}