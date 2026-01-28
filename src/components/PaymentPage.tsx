import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CreditCard, Shield, CheckCircle, ArrowLeft, Loader, Star, Award, ExternalLink, AlertCircle, Mail } from 'lucide-react';
import { supabaseStorageService } from '../services/supabaseStorageService';
import { PAYMENT_CONFIG, isPaymentRequired, shouldSkipPayment, getPaymentPrice, getPaymentMode } from '../config/paymentConfig';
import { STRIPE_CONFIG } from '../config/stripeConfig';

interface PaymentPageProps {
  businessData: any;
  onPaymentComplete: () => void;
  onBack: () => void;
}

export default function PaymentPage({ businessData, onPaymentComplete, onBack }: PaymentPageProps) {
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [legalConsent, setLegalConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    country: 'United Kingdom'
  });

  //const STRIPE_PAYMENT_URL = 'https://buy.stripe.com/5kQ00leCbh153601Kn5Vu00';
  const STRIPE_PAYMENT_URL = 'https://buy.stripe.com/test_4gMeVfeDD1OB0VY3kn6EU00';
  const PAYPAL_PAYMENT_URL = 'https://www.paypal.com/ncp/payment/58AM5HUW54PNA';

  // Check if payment should be skipped
  React.useEffect(() => {
    if (shouldSkipPayment()) {
      // Auto-proceed to results if payment is disabled
      onPaymentComplete({ email: formData.email, skipPayment: true });
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate legal consent
    if (!legalConsent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);
    
    if (!formData.email.trim()) {
      alert('Please enter your email address');
      return;
    }
    
    setIsProcessing(true);

    // Store email and survey data with metadata for webhook processing
    const emailRecord = await supabaseStorageService.saveEmail({
      email: formData.email,
      businessName: businessData.businessName,
      industry: businessData.industry,
      businessType: businessData.businessType,
      paymentStatus: 'pending',
      surveyData: businessData
    });
    
    // Store email in localStorage for payment return handling
    localStorage.setItem('pendingPaymentEmail', formData.email);
    localStorage.setItem('pendingBusinessData', JSON.stringify(businessData));
    
    // Create URL with prefilled customer email and metadata
    const stripeUrl = new URL(STRIPE_PAYMENT_URL);
    stripeUrl.searchParams.set('prefilled_email', formData.email);
    
    // Add success and cancel URLs for better UX
    stripeUrl.searchParams.set('success_url', STRIPE_CONFIG.paymentSuccessUrl);
    stripeUrl.searchParams.set('cancel_url', STRIPE_CONFIG.paymentCancelUrl);
    
    // Redirect to Stripe payment page
    window.location.href = stripeUrl.toString();
  };

  const handlePayPalPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate legal consent
    if (!legalConsent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);
    
    if (!formData.email.trim()) {
      alert('Please enter your email address');
      return;
    }
    
    setIsProcessing(true);

    // Store email and survey data before redirecting to PayPal
    await supabaseStorageService.saveEmail({
      email: formData.email,
      businessName: businessData.businessName,
      industry: businessData.industry,
      businessType: businessData.businessType,
      paymentStatus: 'pending',
      surveyData: businessData
    });
    
    // Store email in localStorage for payment return handling
    localStorage.setItem('pendingPaymentEmail', formData.email);
    localStorage.setItem('pendingBusinessData', JSON.stringify(businessData));
    
    // Redirect to PayPal payment page
    window.location.href = PAYPAL_PAYMENT_URL;
  };

  // Handle successful payment return from Stripe
  React.useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('payment') === 'success') {
      // Get email from localStorage if not in formData
      const paymentEmail = formData.email || localStorage.getItem('pendingPaymentEmail');
      const storedBusinessData = localStorage.getItem('pendingBusinessData');
      
      if (paymentEmail) {
        // Update payment status
        supabaseStorageService.updateEmailStatus(paymentEmail, {
          paymentStatus: 'completed'
        });
        
        // Don't clear localStorage yet - let ThankYouPage handle it
        
        // Pass both email and business data to results
        onPaymentComplete({ 
          email: paymentEmail,
          businessData: storedBusinessData ? JSON.parse(storedBusinessData) : businessData
        });
      } else {
        onPaymentComplete({ email: formData.email, businessData });
      }
    }
  }, [formData.email, onPaymentComplete]);

  const [email, setEmail] = useState('');

  React.useEffect(() => {
    if (businessData?.email) {
      setEmail(businessData.email);
      setFormData(prev => ({ ...prev, email: businessData.email }));
    } else {
      // Check for pending payment email from localStorage
      const pendingEmail = localStorage.getItem('pendingPaymentEmail');
      if (pendingEmail) {
        setEmail(pendingEmail);
        setFormData(prev => ({ ...prev, email: pendingEmail }));
      }
    }
  }, [businessData]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    handleInputChange('email', value);
  };

  // Show payment disabled message if configured
  if (shouldSkipPayment()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {getPaymentMode() === 'free-trial' ? 'Free Trial Activated!' : 
               getPaymentMode() === 'testing' ? 'Testing Mode Active' : 
               'Payment Disabled'}
            </h2>
            
            <p className="text-gray-600 mb-8 text-lg">
              {getPaymentMode() === 'free-trial' 
                ? 'Enjoy your complimentary marketing strategy! We\'re generating your personalized report now.'
                : getPaymentMode() === 'testing'
                ? 'Payment is disabled for testing. Proceeding directly to strategy generation.'
                : 'Payment functionality is currently disabled. Proceeding to strategy generation.'}
            </p>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-blue-800 text-left space-y-2">
                <li>• AI analyzes your business information</li>
                <li>• Comprehensive strategy is generated</li>
                <li>• Professional PDF report is created</li>
                <li>• Strategy is delivered to your email</li>
              </ul>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Mode: <span className="font-medium">{getPaymentMode()}</span></p>
              <p>Redirecting automatically...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Order Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-8 h-fit">
            <div className="flex items-center mb-6">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Custom Marketing Strategy</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{getPaymentPrice()}</div>
                  <div className="text-sm text-gray-500 line-through">£500+</div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Comprehensive marketing strategy for <span className="font-semibold">{businessData.businessName}</span>
              </p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
          {/* Strategy delivery info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <div className="font-semibold text-blue-800">Automatic Email Delivery</div>
                <div className="text-sm text-blue-700 mt-1">
                  Your strategy will be automatically sent to <strong>{formData.email || 'your email address'}</strong> within minutes after payment
                </div>
              </div>
            </div>
          </div>

                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Personalized strategy analysis</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Target audience insights</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>SWOT analysis & recommendations</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Implementation timeline</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Professional PDF report</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Expert review by Marta Belya</span>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <div className="font-semibold text-blue-900">Secure Payment</div>
                  <div className="text-sm text-blue-700">256-bit SSL encryption</div>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                <Award className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <div className="font-semibold text-green-900">Money-Back Guarantee</div>
                  <div className="text-sm text-green-700">7-day full refund policy</div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Star className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <div className="font-semibold text-purple-900">4.9/5 Rating</div>
                  <div className="text-sm text-purple-700">From 2,000+ satisfied customers</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">£50.00</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">One-time payment • No recurring charges</p>
            </div>
          </div>

          {/* Right side - Payment Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>

            <form onSubmit={handleStripePayment} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="your@email.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Your strategy will be sent to this email after payment</p>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose Payment Method
                </label>
                <div className="grid grid-cols-1 gap-4">
                  {/* Stripe Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-4 border-2 rounded-lg flex items-center justify-between transition-all ${
                      paymentMethod === 'stripe' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Credit/Debit Card</div>
                        <div className="text-sm opacity-75">Powered by Stripe</div>
                      </div>
                    </div>
                    <div className="text-xs opacity-75">Visa, Mastercard, Amex</div>
                  </button>

                  {/* PayPal Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 border-2 rounded-lg flex items-center justify-between transition-all ${
                      paymentMethod === 'paypal' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-3 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">P</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">PayPal</div>
                        <div className="text-sm opacity-75">Pay with PayPal account</div>
                      </div>
                    </div>
                    <div className="text-xs opacity-75">Secure & Fast</div>
                  </button>
                </div>
              </div>

              {/* Payment Method Info */}
              {paymentMethod === 'stripe' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">Secure Stripe Payment</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    You'll be redirected to Stripe's secure payment page to complete your purchase.
                  </p>
                  <div className="text-xs text-blue-600 space-y-1">
                    <div>✓ 256-bit SSL encryption</div>
                    <div>✓ PCI DSS compliant</div>
                    <div>✓ Trusted by millions worldwide</div>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-5 h-5 mr-2 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <span className="text-blue-800 font-medium">PayPal Payment</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    You'll be redirected to PayPal to complete your purchase securely.
                  </p>
                  <div className="text-xs text-blue-600 space-y-1">
                    <div>✓ PayPal Buyer Protection</div>
                    <div>✓ No card details required</div>
                    <div>✓ Pay with PayPal balance or linked accounts</div>
                  </div>
                </div>
              )}

              {/* Legal Consent */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={legalConsent}
                    onChange={(e) => {
                      setLegalConsent(e.target.checked);
                      if (e.target.checked) setConsentError(false);
                    }}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                    required
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    I agree to the{' '}
                    <a 
                      href="/terms.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Terms & Conditions
                    </a>
                    ,{' '}
                    <a 
                      href="/privacy.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Privacy Policy
                    </a>
                    {' '}and{' '}
                    <a 
                      href="/cookie.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Cookie Policy
                    </a>
                    .
                  </span>
                </label>
                
                {consentError && (
                  <div className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Please accept the terms and conditions to continue.
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={paymentMethod === 'stripe' ? handleStripePayment : handlePayPalPayment}
                disabled={isProcessing || !legalConsent}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Redirecting to {paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Pay Securely with {paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'} - £50
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  You'll be redirected to {paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'} to complete your payment securely. 
                  By proceeding, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}