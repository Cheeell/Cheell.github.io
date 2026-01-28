import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import MartaBio from './components/MartaBio';
import Pricing from './components/Pricing';
import Blog from './components/Blog';
import Footer from './components/Footer';
import Questionnaire from './components/Questionnaire';
import StrategyResults from './components/StrategyResults';
import PaymentPage from './components/PaymentPage';
import AdminDashboard from './components/AdminDashboard';
import ThankYouPage from './components/ThankYouPage';
import { supabaseStorageService } from './services/supabaseStorageService';
import { isPaymentRequired, shouldSkipPayment } from './config/paymentConfig';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [businessData, setBusinessData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Check for admin access via URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('admin') === 'true' && location.pathname === '/') {
      navigate('/admin');
    }
  }, [location, navigate]);

  const handleGetStarted = () => {
    navigate('/questionnaire');
  };

  const handleQuestionnaireComplete = (data: any) => {
    setBusinessData(data);
    
    // Store survey completion
    supabaseStorageService.saveEmail({
      email: data.email || 'survey-only@temp.com',
      businessName: data.businessName,
      industry: data.industry,
      businessType: data.businessType,
      paymentStatus: 'pending',
      surveyData: data ,
      businessUrl: data.businessUrl
    });
    
    // Check if payment is required
    if (shouldSkipPayment()) {
      // Skip payment and go directly to results
      setPaymentData({ email: data.email, skipPayment: true });
      navigate('/results');
    } else {
      navigate('/payment');
    }
  };

  const handlePaymentComplete = (data?: any) => {
    setPaymentData(data);
    
    // Update payment status if we have email
    const emailToUpdate = data?.email;
    const businessDataToUse = data?.businessData || businessData;
    
    if (emailToUpdate) {
      supabaseStorageService.updateEmailStatus(emailToUpdate, {
        paymentStatus: 'completed'
      });
    }
    
    // Ensure business data is preserved
    if (businessDataToUse && businessDataToUse !== businessData) {
      setBusinessData(businessDataToUse);
    }
    
    navigate('/thanks');
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  const handleBackToQuestionnaire = () => {
    navigate('/questionnaire');
  };

  const handleBackToPayment = () => {
    navigate('/payment');
  };

  const handleBackToThankYou = () => {
    navigate('/thanks');
  };
  
  const handleStartOver = () => {
    setBusinessData(null);
    setPaymentData(null);
    navigate('/');
  };

  const handleBlogNavigation = () => {
    navigate('/blog');
  };

  // Landing page component
  const LandingPage = () => (
    <div className="min-h-screen bg-white">
      <Header onGetStarted={handleGetStarted} onBlogClick={handleBlogNavigation} />
      <Hero onGetStarted={handleGetStarted} />
      <Features />
      <HowItWorks />
      <MartaBio />
      <Pricing onGetStarted={handleGetStarted} />
      <Testimonials />
      <Footer />
    </div>
  );

  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Questionnaire page */}
      <Route 
        path="/questionnaire" 
        element={
          <Questionnaire
            onComplete={handleQuestionnaireComplete}
            onBack={handleBackToLanding}
          />
        } 
      />
      
      {/* Payment page */}
      <Route 
        path="/payment" 
        element={
          <PaymentPage
            businessData={businessData}
            onPaymentComplete={handlePaymentComplete}
            onBack={handleBackToQuestionnaire}
          />
        } 
      />
      
      {/* Thank you page */}
      <Route 
        path="/thanks" 
        element={
          <ThankYouPage
            businessData={businessData}
            paymentData={paymentData}
            onStartOver={handleStartOver}
          />
        } 
      />
      
      {/* Results page */}
      <Route 
        path="/results" 
        element={
          <StrategyResults
            businessData={businessData}
            paymentData={paymentData}
            onBack={handleBackToThankYou}
            onStartOver={handleStartOver}
          />
        } 
      />
      
      {/* Blog page */}
      <Route 
        path="/blog" 
        element={<Blog onBack={handleBackToLanding} />} 
      />
      
      {/* Admin dashboard */}
      <Route 
        path="/admin" 
        element={<AdminDashboard />} 
      />
      
      {/* Catch all route - redirect to home */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;