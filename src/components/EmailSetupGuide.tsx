import React from 'react';
import { Mail, Settings, Key, CheckCircle, ExternalLink } from 'lucide-react';

export default function EmailSetupGuide() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <div className="flex items-center mb-4">
        <Mail className="w-6 h-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-blue-900">Email Setup Required</h3>
      </div>
      
      <p className="text-blue-800 mb-4">
        To enable email delivery, you need to configure EmailJS. Follow these steps:
      </p>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
          <div>
            <p className="text-blue-800 font-medium">Create EmailJS Account</p>
            <p className="text-blue-700 text-sm">
              Visit <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">EmailJS.com</a> and create a free account
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
          <div>
            <p className="text-blue-800 font-medium">Setup Email Service</p>
            <p className="text-blue-700 text-sm">Connect your Gmail, Outlook, or other email provider</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
          <div>
            <p className="text-blue-800 font-medium">Create Email Template</p>
            <p className="text-blue-700 text-sm">Use these template variables:</p>
            <div className="mt-2 bg-blue-100 p-3 rounded text-xs font-mono">
              <div>{'{{to_email}}'} - Recipient email</div>
              <div>{'{{to_name}}'} - Recipient name</div>
              <div>{'{{subject}}'} - Email subject</div>
              <div>{'{{message}}'} - Email content</div>
              <div>{'{{from_name}}'} - Sender name</div>
              <div>{'{{reply_to}}'} - Reply-to email</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</div>
          <div>
            <p className="text-blue-800 font-medium">Configure Template ID</p>
            <p className="text-blue-700 text-sm">Your service ID and public key are already configured. Just add your template ID to the .env file:</p>
            <div className="mt-2 bg-blue-100 p-3 rounded text-xs font-mono">
              <div>VITE_EMAILJS_TEMPLATE_ID=your_template_id</div>
            </div>
            <div className="mt-2 bg-green-100 p-3 rounded text-xs">
              <div className="text-red-800 font-medium">⚠ Service ID: Not configured</div>
              <div className="text-red-800 font-medium">⚠ Template ID: Not configured</div>
              <div className="text-red-800 font-medium">⚠ Public Key: Not configured</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded">
        <div className="flex items-center text-green-800">
          <CheckCircle className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">
            EmailJS offers 200 free emails per month - perfect for testing and small projects!
          </span>
        </div>
      </div>
    </div>
  );
}