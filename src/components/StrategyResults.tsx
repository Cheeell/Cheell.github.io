import React, { useState, useEffect } from 'react';
import { FileText, Download, Mail, CheckCircle, Loader, ArrowLeft, Share2, AlertCircle, Award, Star } from 'lucide-react';
import { sendEmail, sendStrategyEmail, formatSurveyAnswers } from '../services/emailService';
import { supabaseStorageService } from '../services/supabaseStorageService';
import { generateMarketingStrategyWithWebSearch, parseStrategyResponse } from '../services/openaiService';
import { shouldUseChatGPT, isDevelopmentMode } from '../config/aiConfig';
import PDFService from '../services/pdfService';
import { isResendConfigured } from '../services/emailService';
import { isPaymentRequired, getPaymentMode } from '../config/paymentConfig';

interface StrategyResultsProps {
  businessData: any;
  paymentData?: any;
  onBack: () => void;
  onStartOver: () => void;
}

export default function StrategyResults({ businessData, paymentData, onBack, onStartOver }: StrategyResultsProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [useRealAI, setUseRealAI] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Helper function to determine if email should be auto-sent
  const shouldAutoSendEmail = () => {
    // Auto-send if:
    // 1. We have an email address
    // 2. Payment was completed (not skipped) OR payment is disabled
    // 3. Email hasn't been sent yet
    // 4. Strategy is available
    return email && 
           email.trim() && 
           ((paymentData && !paymentData.skipPayment) || !isPaymentRequired()) && 
           !emailSent && 
           strategy;
  };

  // Pre-fill email from payment data if available
  useEffect(() => {
    // Get email from multiple sources
    const emailToUse = paymentData?.email || 
                       businessData?.email || 
                       localStorage.getItem('pendingPaymentEmail') ||
                       '';
    if (emailToUse) {
      setEmail(emailToUse);
    }
    
    // Check if ChatGPT should be used based on config and API key
    const shouldUseAI = shouldUseChatGPT();
    setUseRealAI(shouldUseAI);
    
    if (shouldUseAI) {
      generateStrategy();
    } else {
      generateMockStrategy();
    }
  }, [businessData]);

  // ChatGPT API integration
  const generateStrategy = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setGenerationProgress(20);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 80));
      }, 500);

      console.log('Starting OpenAI strategy generation...');
      
      // Call OpenAI API
      const response = await generateMarketingStrategyWithWebSearch(businessData);
      
      clearInterval(progressInterval);
      setGenerationProgress(90);

      console.log('OpenAI response received, parsing...');
      
      // Parse the response
      const parsedStrategy = parseStrategyResponse(response.content);
      
      setStrategy({
        ...parsedStrategy,
        usage: response.usage,
        generatedAt: new Date().toISOString()
      });
      
      setGenerationProgress(100);
      
      console.log('Strategy generation completed successfully');
      
      // Small delay to show completion
      setTimeout(() => {
        setIsGenerating(false);
        
        // Auto-send email if payment was completed and we have email
        if (shouldAutoSendEmail()) {
          console.log('Strategy generation completed, auto-sending email...');
          setTimeout(() => {
            sendTestEmail();
          }, 500);
        }
      }, 500);
      
    } catch (error) {
      console.error('Strategy generation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate strategy');
      setIsGenerating(false);
    }
  };

  // MOCK STRATEGY GENERATION (for development)
  const generateMockStrategy = () => {
    try {
      setIsGenerating(true);
      setError(null);
      setGenerationProgress(20);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 80));
      }, 300);

      // Simulate API call delay
      setTimeout(() => {
        clearInterval(progressInterval);
        setGenerationProgress(90);

        // Generate mock strategy
        const mockStrategy = generateMockStrategyData(businessData);
        
        setStrategy(mockStrategy);
        setGenerationProgress(100);
        
        // Small delay to show completion
        setTimeout(() => {
          setIsGenerating(false);
          
          // Auto-send email if payment was completed and we have email
          if (shouldAutoSendEmail()) {
            console.log('Mock strategy generation completed, auto-sending email...');
            setTimeout(() => {
              sendTestEmail();
            }, 500);
          }
        }, 500);
      }, 2000);
      
    } catch (error) {
      console.error('Strategy generation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate strategy');
      setIsGenerating(false);
    }
  };

  const generateMockStrategyData = (data: any) => {
    return {
      fullContent: `# COMPREHENSIVE MARKETING STRATEGY FOR ${data.businessName?.toUpperCase() || 'YOUR BUSINESS'}

## EXECUTIVE SUMMARY

${data.businessName || 'Your business'} is well-positioned to capitalize on the growing ${data.industry?.toLowerCase() || 'market'} sector. With a focus on ${data.businessType || 'B2B/B2C'} customers and a monthly budget of ${data.marketingBudget || 'your allocated budget'}, we recommend a multi-channel digital marketing approach that emphasizes customer acquisition, retention, and brand building.

Key opportunities include leveraging digital transformation trends, targeting underserved customer segments, and building a strong online presence. The strategy focuses on ${data.marketingGoals?.slice(0, 2).join(' and ') || 'growth and customer acquisition'} while addressing current challenges such as ${data.currentChallenges?.slice(0, 2).join(' and ') || 'market competition and brand awareness'}.

Expected outcomes include a 25-40% increase in qualified leads, improved brand recognition, and a measurable return on marketing investment within 6 months.

## TARGET AUDIENCE ANALYSIS

### Primary Audience
**Demographics:**
- ${data.targetAudience || 'Based on your industry, we\'ve identified key demographic segments most likely to convert'}
- Age range: 25-45 years (primary), 35-55 years (secondary)
- Income level: Middle to upper-middle class
- Geographic focus: Urban and suburban areas
- Education: College-educated professionals

**Psychographics:**
- Value efficiency, reliability, and cost-effectiveness
- Tech-savvy and comfortable with digital solutions
- Seek trusted brands and peer recommendations
- Time-conscious and prefer streamlined experiences
- Quality-focused rather than price-sensitive

**Behavioral Patterns:**
- Research extensively before purchasing
- Influenced by online reviews and testimonials
- Active on social media and professional networks
- Prefer educational content over direct sales pitches
- Respond well to personalized communications

## SWOT ANALYSIS

### Strengths
- Strong unique value proposition: "${data.uniqueValue || 'Clear differentiation in the market'}"
- Appropriate budget allocation for growth phase
- Clear understanding of target market needs
- ${data.businessType === 'B2B' ? 'Strong potential for recurring revenue' : 'Direct consumer relationship opportunities'}

### Weaknesses
- Limited current marketing activities: ${data.currentMarketing?.join(', ') || 'Minimal digital presence'}
- Brand awareness challenges in competitive market
- Need for stronger online presence and content strategy
- Potential resource constraints for rapid scaling

### Opportunities
- Growing demand in ${data.industry || 'your industry'} sector
- Digital transformation creating new customer touchpoints
- Underserved customer segments in your target market
- Potential for strategic partnerships and collaborations

### Threats
- Increasing competition from established players
- Economic uncertainty affecting customer spending
- Rapidly changing digital marketing landscape
- Potential market saturation in key segments

## RECOMMENDED MARKETING CHANNELS

### 1. Content Marketing (Priority: HIGH)
**Budget Allocation:** 30% of total marketing budget
**Rationale:** Builds authority, drives organic traffic, and nurtures leads through the sales funnel
**Key Tactics:**
- Weekly blog posts addressing customer pain points
- Educational video content and tutorials
- Industry insights and thought leadership pieces
- SEO-optimized content for organic discovery

### 2. Social Media Marketing (Priority: HIGH)
**Budget Allocation:** 25% of total marketing budget
**Rationale:** Direct customer engagement, brand building, and community development
**Key Tactics:**
- LinkedIn for B2B engagement and thought leadership
- Instagram/Facebook for brand storytelling and customer testimonials
- Regular posting schedule with engaging visual content
- Social listening and community management

### 3. Email Marketing (Priority: MEDIUM)
**Budget Allocation:** 15% of total marketing budget
**Rationale:** Cost-effective customer retention and lead nurturing
**Key Tactics:**
- Welcome series for new subscribers
- Weekly newsletters with valuable insights
- Automated drip campaigns for lead nurturing
- Segmented campaigns based on customer behavior

### 4. Paid Digital Advertising (Priority: MEDIUM)
**Budget Allocation:** 30% of total marketing budget
**Rationale:** Rapid lead generation, testing, and market penetration
**Key Tactics:**
- Google Ads for high-intent keyword targeting
- LinkedIn Ads for B2B lead generation
- Facebook/Instagram Ads for brand awareness
- Retargeting campaigns for website visitors

## IMPLEMENTATION TIMELINE

### Phase 1 (Months 1-2): Foundation & Setup
**Key Activities:**
- Brand positioning and messaging refinement
- Website optimization and conversion rate improvement
- Content strategy development and editorial calendar
- Social media profile optimization and content planning
- Email marketing automation setup

**Milestones:**
- Complete brand audit and positioning
- Launch optimized website with clear value proposition
- Publish first 8 pieces of educational content
- Build email list of 500+ subscribers

### Phase 2 (Months 3-4): Launch & Scale
**Key Activities:**
- Paid advertising campaign launch and optimization
- Content marketing acceleration (2-3 posts per week)
- Social media engagement and community building
- Lead nurturing automation implementation
- Performance tracking and analytics setup

**Milestones:**
- Generate 200+ qualified leads per month
- Achieve 10,000+ monthly website visitors
- Build social media following of 2,000+ engaged followers
- Implement comprehensive tracking and reporting

### Phase 3 (Months 5-6): Optimize & Expand
**Key Activities:**
- Campaign optimization based on performance data
- Channel expansion to high-performing platforms
- Customer feedback integration and strategy refinement
- Partnership and collaboration opportunities
- Advanced automation and personalization

**Milestones:**
- Achieve target cost per acquisition (CPA)
- Expand to 2-3 additional marketing channels
- Implement advanced lead scoring and segmentation
- Develop customer advocacy and referral programs

## KEY PERFORMANCE INDICATORS (KPIs)

### Primary KPIs
- **Monthly Recurring Revenue (MRR):** Target 15-25% month-over-month growth
- **Customer Acquisition Cost (CAC):** Reduce by 20% within 6 months
- **Lead Generation:** 300+ qualified leads per month by month 4
- **Conversion Rate:** Achieve 3-5% website-to-lead conversion rate

### Secondary KPIs
- **Brand Awareness:** 40% increase in organic search volume
- **Social Media Engagement:** 5% average engagement rate across platforms
- **Email Marketing:** 25% open rate, 5% click-through rate
- **Customer Lifetime Value (CLV):** Increase by 30% through retention strategies

## BUDGET ALLOCATION BREAKDOWN

**Monthly Budget Distribution (${data.marketingBudget || 'Based on your budget'}):**
- Content Creation & SEO: 30%
- Paid Advertising: 30%
- Social Media Management: 25%
- Email Marketing Tools: 10%
- Analytics & Marketing Tools: 5%

## COMPETITIVE POSITIONING

**Differentiation Strategy:**
Your unique value proposition of "${data.uniqueValue || 'superior customer experience and innovative solutions'}" positions you distinctly from competitors like ${data.competitorAnalysis || 'major market players'}.

**Key Messaging Pillars:**
1. Expertise and reliability in ${data.industry || 'your field'}
2. Customer-centric approach and personalized solutions
3. Innovation and forward-thinking methodology
4. Proven results and measurable outcomes

## NEXT STEPS (Next 30 Days)

1. **Week 1:** Complete brand audit and refine messaging framework
2. **Week 2:** Optimize website for conversions and user experience
3. **Week 3:** Set up analytics, tracking, and reporting infrastructure
4. **Week 4:** Launch content marketing with first 4 educational pieces
5. **Ongoing:** Begin social media content creation and posting schedule
6. **Ongoing:** Set up email marketing automation and lead magnets
7. **Month End:** Review performance and adjust strategy based on initial results

---

*This strategy was created specifically for ${data.businessName || 'your business'} based on the provided business information. Regular review and optimization are recommended to ensure continued effectiveness and ROI.*`,
      generatedAt: new Date().toISOString(),
      usage: {
        total_tokens: 3500,
        prompt_tokens: 1200,
        completion_tokens: 2300
      }
    };
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendTestEmail();
  };

  const sendTestEmail = async () => {
    if (!email.trim()) return;
    
    setIsEmailSending(true);
    setError(null);
    
    try {
      // Update email status to show strategy generated
      await supabaseStorageService.updateEmailStatus(email, {
        strategyGenerated: true,
        paymentStatus: paymentData && !paymentData.skipPayment ? 'completed' : 'pending'
      });
      
      // Send complete strategy email with survey answers
      console.log('Generating PDF for email attachment...');
      const pdfBase64 = await PDFService.generatePDFFromChatGPT(
        businessData,
        strategy?.fullContent || 'Strategy content not available',
        { includeCharts: true, includeVisuals: true }
      );
      
      console.log('Sending email with PDF attachment...');
      await sendStrategyEmail(
        email,
        businessData,
        strategy?.fullContent || 'Strategy content not available',
        {
          filename: `${businessData.businessName || 'Business'}_Marketing_Strategy.pdf`,
          content: pdfBase64,
          type: 'application/pdf'
        }
      );
      
      // Update email sent status
      await supabaseStorageService.updateEmailStatus(email, {
        emailSent: true
      });
      
      setEmailSent(true);
      console.log('✅ Email with PDF attachment sent successfully');
      
      // Clear any pending payment data from localStorage
      localStorage.removeItem('pendingPaymentEmail');
      localStorage.removeItem('pendingBusinessData');
      
    } catch (error) {
      console.error('Email sending error:', error);
      
      let errorMessage = 'Failed to send email. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('not properly configured')) {
          errorMessage = 'Resend email service not configured. Please check your API key in environment variables.';
        } else if (error.message.includes('Invalid Resend API key format')) {
          errorMessage = 'Invalid API key format. Resend API keys should start with "re_".';
        } else if (error.message.includes('Invalid API key')) {
          errorMessage = 'Invalid API key. Please check your Resend API key in the dashboard.';
        } else if (error.message.includes('Domain not verified')) {
          errorMessage = 'Email domain not verified. Please verify your sending domain in Resend dashboard.';
        } else if (error.message.includes('Rate limit')) {
          errorMessage = 'Too many emails sent. Please wait a moment and try again.';
        } else if (error.message.includes('Browser security restrictions')) {
          errorMessage = 'Email service unavailable: This is a browser security limitation. For production use, email sending needs to be handled by a backend server. You can still download the PDF report below.';
        } else {
          errorMessage = `Email error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsEmailSending(false);
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    setError(null);
    
    try {
      console.log('Starting PDF generation...');
      
      // Use enhanced ChatGPT to PDF service
      const PDFService = await import('../services/pdfService');
      await PDFService.default.downloadChatGPTPDF(
        businessData,
        strategy?.fullContent || 'Strategy content not available',
        { includeCharts: true, includeVisuals: true }
      );
      
      console.log('✅ PDF downloaded successfully');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(`PDF Generation Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support.`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleRetry = () => {
    if (useRealAI) {
      generateStrategy();
    } else {
      generateMockStrategy();
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Strategy Generation Failed
          </h2>
          <p className="text-gray-600 mb-8">
            {error}
          </p>
          <div className="space-y-4">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {shouldUseChatGPT() ? 'Retry with AI' : 'Generate Sample Strategy'}
            </button>
            <button
              onClick={onBack}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Questions
            </button>
          </div>
          
          {(error.includes('API key') || error.includes('disabled in configuration')) && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
              <h3 className="font-semibold text-yellow-800 mb-2">Setup Required:</h3>
              <p className="text-sm text-yellow-700">
                To use AI strategy generation and email delivery:
              </p>
              <ol className="list-decimal list-inside mt-2 text-sm text-yellow-700 space-y-1">
                <li>For email testing, only Resend configuration is needed</li>
                <li>Add your Resend API key to Supabase Edge Functions:</li>
                <li>To enable AI later, set <code className="bg-yellow-100 px-1 rounded">useChatGPT: true</code> in config</li>
              </ol>
              <code className="block mt-1 p-2 bg-yellow-100 rounded text-xs">
                supabase secrets set RESEND_API_KEY=re_your-resend-key
                <br />
                supabase secrets set FROM_EMAIL=noreply@yourdomain.com
              </code>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {shouldUseChatGPT() ? 'AI is Crafting Your Custom Strategy...' : 'Generating Sample Strategy for Email Testing...'}
          </h2>
          <p className="text-gray-600 mb-8">
            {shouldUseChatGPT() && businessData.businessUrl
              ? `Our AI is analyzing your website (${businessData.businessUrl}) and business data to create a personalized marketing strategy tailored specifically for ${businessData.businessName}.`
              : shouldUseChatGPT() 
              ? `Our AI is analyzing your business data and creating a personalized marketing strategy tailored specifically for ${businessData.businessName}.`
              : `Generating a sample marketing strategy for ${businessData.businessName} to test email delivery functionality.`
            }
          </p>
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
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
              {generationProgress >= 30 && generationProgress < 60 && businessData.businessUrl && " • Analyzing your website..."}
              {generationProgress >= 60 && generationProgress < 90 && "Generating strategic recommendations..."}
              {generationProgress >= 90 && "Finalizing your strategy..."}
            </div>
            {shouldUseChatGPT() && (
              <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                ✨ Using real AI (ChatGPT-4o) with web search to analyze your website and generate your strategy
              </div>
            )}
            {!shouldUseChatGPT() && (
              <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                📧 Email Testing Mode: Using sample strategy data (OpenAI disabled for testing)
                <br />
                📧 Email service: {isResendConfigured() ? 'Resend configured' : 'Resend not configured'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Payment
              </button>
              <button
                onClick={onStartOver}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Start Over
              </button>
            </div>
            
            <div className="flex items-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Your Custom Marketing Strategy is Ready!
                </h1>
                <p className="text-gray-600 mt-2">
                  Generated for {businessData.businessName} • {new Date().toLocaleDateString()}
                </p>
                {paymentData && !paymentData.skipPayment && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Payment Confirmed
                  </div>
                )}
                {paymentData?.skipPayment && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {getPaymentMode() === 'free-trial' ? 'Free Trial' : 
                     getPaymentMode() === 'testing' ? 'Testing Mode' : 
                     'Payment Disabled'}
                  </div>
                )}
                {strategy?.usage && (
                  <p className="text-sm text-gray-500 mt-1">
                    Generated using {strategy.usage.total_tokens} tokens
                  </p>
                )}
              </div>
            </div>

            {!emailSent ? (
              <form onSubmit={handleEmailSubmit} className="flex gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={email ? "Email confirmed from payment" : "Enter your email to receive the full PDF report"}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  readOnly={!!(paymentData?.email || email)}
                  required
                />
                <button
                  type="submit"
                  disabled={isEmailSending || !email.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isEmailSending ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Send Strategy Report
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-green-800">
                    Your complete marketing strategy has been sent to {email}! Check your inbox.
                  </span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <span className="text-red-800 font-medium">Email Error:</span>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                    <div className="mt-3 text-xs text-red-600">
                      <p><strong>Troubleshooting:</strong></p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Check browser console for detailed error logs</li>
                        <li>Verify Resend API key in .env file</li>
                        <li>Ensure your sending domain is verified in Resend dashboard</li>
                        <li>Check Resend dashboard for delivery status at resend.com</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="prose max-w-none">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
                <h2 className="text-xl font-bold text-blue-900 mb-2">Custom Strategy Preview</h2>
                <p className="text-blue-800">
                  This is a preview of your comprehensive marketing strategy. The full detailed report will be sent to your email.
                </p>
                {isDevelopmentMode() && (
                  <div className="mt-3 text-sm text-blue-700 bg-blue-100 p-2 rounded">
                    <strong>Development Mode:</strong> This is a sample strategy. Enable ChatGPT in config to use real AI generation.
                  </div>
                )}
                {shouldUseChatGPT() && (
                  <div className="mt-3 text-sm text-green-700 bg-green-100 p-2 rounded">
                    <strong>AI Generated:</strong> This strategy was created using ChatGPT based on your specific business information.
                    {businessData.businessUrl && (
                      <>
                        <br />
                        <strong>Website Analyzed:</strong> Your website ({businessData.businessUrl}) was analyzed to provide more accurate recommendations.
                      </>
                    )}
                  </div>
                )}
                {paymentData && (
                  <div className="mt-3 text-sm text-green-700 bg-green-100 p-2 rounded">
                    <strong>Payment Confirmed:</strong> Thank you for your purchase! Your strategy has been generated and is ready for delivery.
                  </div>
                )}
                {paymentData?.skipPayment && (
                  <div className="mt-3 text-sm text-blue-700 bg-blue-100 p-2 rounded">
                    <strong>{getPaymentMode() === 'free-trial' ? 'Free Trial Active:' : 
                             getPaymentMode() === 'testing' ? 'Testing Mode:' : 
                             'Payment Disabled:'}</strong> Your strategy has been generated and is ready for delivery.
                  </div>
                )}
              </div>
              
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {strategy?.fullContent || 'Strategy content not available'}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="space-y-6">
                {/* Premium PDF Download Section */}
                <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Professional Strategy Report
                    </h3>
                    <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                      Download your complete marketing strategy as a comprehensive report. 
                      Perfect for sharing with your team, investors, or implementing step-by-step.
                    </p>
                  </div>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center mb-2">
                        <Award className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-semibold text-gray-900">Professional Format</span>
                      </div>
                      <p className="text-sm text-gray-600">Beautifully formatted document ready for presentation</p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-semibold text-gray-900">Complete Analysis</span>
                      </div>
                      <p className="text-sm text-gray-600">Full strategy with SWOT, timelines, and KPIs</p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center mb-2">
                        <Star className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="font-semibold text-gray-900">Actionable Insights</span>
                      </div>
                      <p className="text-sm text-gray-600">Ready-to-implement recommendations and next steps</p>
                    </div>
                  </div>
                  
                  {/* Download Button */}
                  <div className="text-center">
                    <button 
                      onClick={generatePDF}
                      disabled={isGeneratingPDF}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 disabled:transform-none group"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <Loader className="w-6 h-6 mr-3 animate-spin" />
                          Generating Professional PDF...
                        </>
                      ) : (
                        <>
                          <Download className="w-6 h-6 mr-3" />
                          Download Professional PDF Report
                        </>
                      )}
                    </button>
                    
                    {!isGeneratingPDF && (
                      <p className="text-sm text-gray-500 mt-3">
                        Professional PDF with charts, formatting, and complete analysis • Ready for presentation
                      </p>
                    )}
                  </div>
                  
                  {/* Trust Indicators */}
                  <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-gray-500">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span>Instant Download</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span>No Watermarks</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span>Print Ready</span>
                    </div>
                  </div>
                </div>
                
                {/* Secondary Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="bg-white border-2 border-blue-200 text-blue-700 py-3 px-6 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 flex items-center justify-center font-semibold shadow-sm hover:shadow-md">
                    <Mail className="w-5 h-5 mr-2" />
                    Email Strategy Again
                  </button>
                  <button className="bg-white border-2 border-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center font-semibold shadow-sm hover:shadow-md">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share with Team
                  </button>
                </div>
                
                {/* Additional Value Props */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-green-900 mb-2">Your Strategy is Ready for Implementation</h4>
                      <p className="text-green-800 text-sm leading-relaxed">
                        This comprehensive report includes everything you need to transform your marketing: 
                        detailed analysis, step-by-step timelines, budget breakdowns, and measurable KPIs. 
                        Start implementing immediately or share with your team for collaborative execution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Original buttons moved to secondary position */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <Download className="w-5 h-5 mr-2" />
                  Download Text Version
                </button>
                <button 
                  onClick={onStartOver}
                  className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Create New Strategy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}