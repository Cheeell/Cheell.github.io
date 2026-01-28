import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Mail,
  TrendingUp,
  Download,
  Calendar,
  Eye,
  DollarSign,
  FileText,
  RefreshCw,
  Webhook,
  AlertTriangle,
  X,
  CheckCircle
} from 'lucide-react';
import { supabaseStorageService } from '../services/supabaseStorageService';
import type { EmailEntry, DailyStats } from '../services/supabaseClient';
import WebhookService from '../services/webhookService';
import { getWebhookUrl, STRIPE_WEBHOOK_EVENTS } from '../config/stripeConfig';

export default function AdminDashboard() {
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);
  const [recentEmails, setRecentEmails] = useState<EmailEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [webhookStatus, setWebhookStatus] = useState<any>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailEntry | null>(null);
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  useEffect(() => {
    loadData();
    loadWebhookStatus();
  }, [selectedPeriod]);

  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // Load today's stats
      const today = await supabaseStorageService.getTodayStats();
      setTodayStats(today);
    
      // Load period stats
      let periodStats: DailyStats[] = [];
      switch (selectedPeriod) {
        case 'today':
          periodStats = today ? [today] : [];
          break;
        case 'week':
          periodStats = await supabaseStorageService.getWeeklyStats();
          break;
        case 'month':
          periodStats = await supabaseStorageService.getMonthlyStats();
          break;
      }
      setWeeklyStats(periodStats);
    
      // Load recent emails (last 10)
      const allEmails = await supabaseStorageService.getAllEmails();
      const recent = allEmails.slice(0, 10); // Already sorted by created_at DESC
      setRecentEmails(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    
    setIsLoading(false);
  };

  const loadWebhookStatus = async () => {
    try {
      const status = await WebhookService.getWebhookStatus();
      setWebhookStatus(status);
    } catch (error) {
      console.error('Error loading webhook status:', error);
    }
  };

  const calculateTotals = (stats: DailyStats[]) => {
    return stats.reduce((acc, day) => ({
      total_emails: acc.total_emails + day.total_emails,
      unique_emails: acc.unique_emails + day.unique_emails,
      surveys_completed: acc.surveys_completed + day.surveys_completed,
      payments_completed: acc.payments_completed + day.payments_completed,
      strategies_generated: acc.strategies_generated + day.strategies_generated,
      emails_sent: acc.emails_sent + day.emails_sent
    }), {
      total_emails: 0,
      unique_emails: 0,
      surveys_completed: 0,
      payments_completed: 0,
      strategies_generated: 0,
      emails_sent: 0
    });
  };

  const downloadEmails = async () => {
    const csv = await supabaseStorageService.exportEmails();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategyai-emails-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadStats = async () => {
    const csv = await supabaseStorageService.exportStats();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategyai-stats-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totals = calculateTotals(weeklyStats);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor your StrategyAI performance and customer data</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadData}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                {(['today', 'week', 'month'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Emails</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {selectedPeriod === 'today' ? todayStats?.total_emails : totals.total_emails}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Unique Visitors</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {selectedPeriod === 'today' ? todayStats?.unique_emails : totals.unique_emails}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Payments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {selectedPeriod === 'today' ? todayStats?.payments_completed : totals.payments_completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Strategies Sent</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {selectedPeriod === 'today' ? todayStats?.emails_sent : totals.emails_sent}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Webhook Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Webhook className="w-6 h-6 text-blue-600 mr-2" />
              Stripe Webhook Status
            </h2>
            <button
              onClick={loadWebhookStatus}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                webhookStatus?.configured ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <div>
                <div className="font-medium text-gray-900">Configuration</div>
                <div className="text-sm text-gray-600">
                  {webhookStatus?.configured ? 'Configured' : 'Not configured'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Recent Events</div>
                <div className="text-sm text-gray-600">
                  {webhookStatus?.recentEvents || 0} in last 24h
                </div>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <AlertTriangle className={`w-5 h-5 mr-3 ${
                (webhookStatus?.failedEvents || 0) > 0 ? 'text-red-600' : 'text-green-600'
              }`} />
              <div>
                <div className="font-medium text-gray-900">Failed Events</div>
                <div className="text-sm text-gray-600">
                  {webhookStatus?.failedEvents || 0} failures
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Webhook Endpoint</h3>
            <code className="text-sm text-blue-800 bg-blue-100 px-2 py-1 rounded">
              {getWebhookUrl()}
            </code>
            <p className="text-sm text-blue-700 mt-2">
              Configure this URL in your Stripe dashboard to enable automatic payment processing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Emails */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Emails</h2>
                <button
                  onClick={downloadEmails}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentEmails.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No emails collected yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEmails.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="font-medium text-gray-900">{email.email}</div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            email.payment_status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : email.payment_status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {email.payment_status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {email.business_name} • {email.industry}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(email.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {email.strategy_generated && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" title="Strategy Generated" />
                        )}
                        {email.email_sent && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" title="Email Sent" />
                        )}
                        <button
                          onClick={() => {
                            setSelectedEmail(email);
                            setShowSurveyModal(true);
                          }}
                          className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Survey
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Industry Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Industry Breakdown</h2>
                <button
                  onClick={downloadStats}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
            <div className="p-6">
              {todayStats && Object.keys(todayStats.industries).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(todayStats.industries)
                    .sort(([,a], [,b]) => b - a)
                    .map(([industry, count]) => (
                      <div key={industry} className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">{industry}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ 
                                width: `${(count / Math.max(...Object.values(todayStats.industries || {}))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No industry data yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Estimate */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Revenue Estimate</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    £{(todayStats?.payments_completed || 0) * 50}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-green-600">
                    £{totals.payments_completed * 50}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totals.total_emails > 0 
                      ? Math.round((totals.payments_completed / totals.total_emails) * 100)
                      : 0
                    }%
                  </p>
                </div>
              </div>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Survey Data Modal */}
        {showSurveyModal && selectedEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Survey Data</h2>
                <button
                  onClick={() => {
                    setShowSurveyModal(false);
                    setSelectedEmail(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="font-semibold text-blue-900 mb-2">Customer Contact</div>
                  <div className="text-blue-800">{selectedEmail.email}</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Submitted: {new Date(selectedEmail.created_at).toLocaleString()}
                  </div>
                </div>

                {selectedEmail.survey_data ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        Business Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium text-gray-700">Business Name:</span> <span className="text-gray-900">{selectedEmail.survey_data.businessName || 'N/A'}</span></div>
                        <div><span className="font-medium text-gray-700">Industry:</span> <span className="text-gray-900">{selectedEmail.survey_data.industry || 'N/A'}</span></div>
                        <div><span className="font-medium text-gray-700">Business Type:</span> <span className="text-gray-900">{selectedEmail.survey_data.businessType || 'N/A'}</span></div>
                        <div><span className="font-medium text-gray-700">Region:</span> <span className="text-gray-900">{selectedEmail.survey_data.regionOfOperation || 'N/A'}</span></div>
                        {selectedEmail.survey_data.businessUrl && (
                          <div><span className="font-medium text-gray-700">Website:</span> <a href={selectedEmail.survey_data.businessUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedEmail.survey_data.businessUrl}</a></div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Target Audience</h3>
                      <p className="text-sm text-gray-800">{selectedEmail.survey_data.targetAudience || 'N/A'}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Budget & Revenue</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium text-gray-700">Current Revenue:</span> <span className="text-gray-900">{selectedEmail.survey_data.currentRevenue || 'N/A'}</span></div>
                        <div><span className="font-medium text-gray-700">Marketing Budget:</span> <span className="text-gray-900">{selectedEmail.survey_data.marketingBudget || 'N/A'}</span></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Marketing Goals</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmail.survey_data.marketingGoals && selectedEmail.survey_data.marketingGoals.length > 0 ? (
                          selectedEmail.survey_data.marketingGoals.map((goal: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{goal}</span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No goals specified</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Current Challenges</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmail.survey_data.currentChallenges && selectedEmail.survey_data.currentChallenges.length > 0 ? (
                          selectedEmail.survey_data.currentChallenges.map((challenge: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">{challenge}</span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No challenges specified</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Competition & Market Position</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 block mb-1">Main Competitors:</span>
                          <p className="text-gray-800">{selectedEmail.survey_data.competitorAnalysis || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 block mb-1">Unique Value Proposition:</span>
                          <p className="text-gray-800">{selectedEmail.survey_data.uniqueValue || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Current Marketing Activities</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmail.survey_data.currentMarketing && selectedEmail.survey_data.currentMarketing.length > 0 ? (
                          selectedEmail.survey_data.currentMarketing.map((activity: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">{activity}</span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No activities specified</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Implementation Timeline</h3>
                      <p className="text-sm text-gray-800">{selectedEmail.survey_data.timeframe || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <p className="text-gray-600">No survey data available for this email</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}