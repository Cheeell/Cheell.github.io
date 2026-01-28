import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PDFRequest {
  businessData: any;
  strategyContent: string;
  includeCharts?: boolean;
  includeVisuals?: boolean;
}

// Enhanced PDF generation with better HTML structure
function generateEnhancedPDF(businessData: any, strategyContent: string): string {
  // Clean and format the strategy content
  const formattedContent = strategyContent
    .replace(/#{1,6}\s*/g, '') // Remove markdown headers
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
    .replace(/\n\n/g, '</p><p>') // Paragraphs
    .replace(/\n/g, '<br>'); // Line breaks

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Marketing Strategy - ${businessData.businessName || 'Business'}</title>
    <style>
        @page {
            margin: 20mm;
            size: A4;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background: white;
        }
        
        .cover-page {
            text-align: center;
            padding: 60px 0;
            border-bottom: 4px solid #3b82f6;
            margin-bottom: 40px;
            page-break-after: always;
        }
        
        .cover-page h1 {
            color: #1e40af;
            font-size: 3em;
            margin: 0 0 20px 0;
            font-weight: bold;
            letter-spacing: 2px;
        }
        
        .cover-page .subtitle {
            color: #6b7280;
            font-size: 1.3em;
            margin-bottom: 40px;
        }
        
        .business-name {
            color: #3b82f6;
            font-size: 2.2em;
            font-weight: bold;
            margin: 30px 0;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 15px;
            display: inline-block;
        }
        
        .business-info {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 40px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .business-info h2 {
            color: #1e40af;
            margin-top: 0;
            font-size: 1.5em;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        
        .info-item {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 5px solid #3b82f6;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .info-label {
            font-weight: bold;
            color: #374151;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            color: #1f2937;
            margin-top: 8px;
            font-size: 1.1em;
        }
        
        .strategy-content {
            margin-top: 40px;
            line-height: 1.8;
        }
        
        .strategy-content h1 {
            color: #1e40af;
            font-size: 2em;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 15px;
            margin-top: 40px;
            margin-bottom: 25px;
            page-break-after: avoid;
        }
        
        .strategy-content h2 {
            color: #374151;
            font-size: 1.5em;
            margin-top: 35px;
            margin-bottom: 20px;
            border-left: 5px solid #3b82f6;
            padding-left: 15px;
            page-break-after: avoid;
        }
        
        .strategy-content h3 {
            color: #4b5563;
            font-size: 1.2em;
            margin-top: 25px;
            margin-bottom: 15px;
        }
        
        .strategy-content p {
            margin-bottom: 15px;
            text-align: justify;
        }
        
        .strategy-content ul, .strategy-content ol {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .strategy-content li {
            margin-bottom: 8px;
        }
        
        .highlight-box {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 5px solid #1e40af;
        }
        
        .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 0.9em;
            page-break-inside: avoid;
        }
        
        .footer .logo {
            font-size: 1.5em;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        
        @media print {
            body { 
                margin: 0; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .cover-page { 
                page-break-after: always; 
            }
            .strategy-content h1 { 
                page-break-after: avoid; 
            }
            .strategy-content h2 { 
                page-break-after: avoid; 
            }
        }
    </style>
</head>
<body>
    <div class="cover-page">
        <h1>MARKETING STRATEGY</h1>
        <div class="subtitle">AI-Powered Business Analysis & Recommendations</div>
        <div class="business-name">${businessData.businessName || 'Your Business'}</div>
        <div style="margin-top: 40px; color: #6b7280; font-size: 1.1em;">
            Generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
        </div>
    </div>

    <div class="business-info">
        <h2>Business Overview</h2>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Industry</div>
                <div class="info-value">${businessData.industry || 'Not specified'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Business Type</div>
                <div class="info-value">${businessData.businessType || 'Not specified'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Current Revenue</div>
                <div class="info-value">${businessData.currentRevenue || 'Not specified'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Marketing Budget</div>
                <div class="info-value">${businessData.marketingBudget || 'Not specified'}</div>
            </div>
        </div>
        
        ${businessData.targetAudience ? `
        <div style="margin-top: 25px;">
            <div class="info-label">Target Audience</div>
            <div class="info-value" style="margin-top: 10px; font-style: italic;">
                "${businessData.targetAudience}"
            </div>
        </div>
        ` : ''}
    </div>

    <div class="strategy-content">
        <p>${formattedContent}</p>
    </div>

    <div class="footer">
        <div class="logo">StrategyAI</div>
        <p><strong>Professional Marketing Strategy Report</strong></p>
        <p>This comprehensive strategy was generated using advanced AI analysis</p>
        <p>tailored specifically for ${businessData.businessName || 'your business'}.</p>
        <p style="margin-top: 20px;">© 2024 StrategyAI. All rights reserved.</p>
    </div>
</body>
</html>
  `;

  // Convert HTML to base64
  return btoa(unescape(encodeURIComponent(htmlContent)));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { businessData, strategyContent, includeCharts, includeVisuals }: PDFRequest = await req.json()

    if (!businessData || !strategyContent) {
      return new Response(
        JSON.stringify({ error: 'Business data and strategy content are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Generating enhanced PDF for:', businessData.businessName);

    // Generate enhanced PDF
    const pdfBase64 = generateEnhancedPDF(businessData, strategyContent);

    console.log('Enhanced PDF generated successfully');

    return new Response(
      JSON.stringify({
        pdfBase64,
        filename: `${businessData.businessName || 'Business'}_Marketing_Strategy_${new Date().toISOString().split('T')[0]}.pdf`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-pdf function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})