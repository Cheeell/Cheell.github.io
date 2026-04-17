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

    supabaseStorageService.saveEmail({
      email: data.email || 'survey-only@temp.com',
      businessName: data.businessName,
      industry: data.industry,
      businessType: data.businessType,
      businessUrl: data.businessUrl,
      areaOfOperation: data.areaOfOperation,
      targetAudience: data.targetAudience,
      currentRevenue: data.currentRevenue,
      marketingBudget: data.marketingBudget,
      marketingGoals: data.marketingGoals,
      currentChallenges: data.currentChallenges,
      competitorAnalysis: data.competitorAnalysis,
      uniqueValue: data.uniqueValue,
      currentMarketing: data.currentMarketing,
      timeframe: data.timeframe,
      paymentStatus: 'pending',
      surveyData: data
    });

    if (shouldSkipPayment()) {
      setPaymentData({ email: data.email, skipPayment: true });
      navigate('/results');
    } else {
      navigate('/payment');
    }
  };

  const handlePaymentComplete = (data?: any) => {
    setPaymentData(data);

    const emailToUpdate = data?.email;
    const businessDataToUse = data?.businessData || businessData;

    if (emailToUpdate) {
      supabaseStorageService.updateEmailStatus(emailToUpdate, {
        paymentStatus: 'completed'
      });
    }

    if (businessDataToUse && businessDataToUse !== businessData) {
      setBusinessData(businessDataToUse);
    }

    navigate('/thanks');
  };

  const handleBackToLanding = () => navigate('/');
  const handleBackToQuestionnaire = () => navigate('/questionnaire');
  const handleBackToThankYou = () => navigate('/thanks');
  const handleStartOver = () => {
    setBusinessData(null);
    setPaymentData(null);
    navigate('/');
  };
  const handleBlogNavigation = () => navigate('/blog');

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
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/questionnaire"
        element={
          <Questionnaire
            onComplete={handleQuestionnaireComplete}
            onBack={handleBackToLanding}
          />
        }
      />

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

      <Route path="/thanks" element={<ThankYouPage />} />

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

      <Route path="/blog" element={<Blog onBack={handleBackToLanding} />} />

      <Route path="/admin" element={<AdminDashboard />} />

      {/* Catch-all */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;