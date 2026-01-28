// Backend service to interact with Supabase Edge Functions

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export interface StrategyResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  generatedAt: string;
}

export interface PDFResponse {
  pdfBase64: string;
  filename: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
}

class BackendService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `${SUPABASE_URL}/functions/v1`;
    this.headers = {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  async generateStrategy(businessData: any): Promise<StrategyResponse> {
    try {
      console.log('Calling backend strategy generation...');
      
      const response = await fetch(`${this.baseUrl}/generate-strategy`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ businessData })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Strategy generated successfully via backend');
      
      return data;
    } catch (error) {
      console.error('Backend strategy generation failed:', error);
      throw new Error(`Failed to generate strategy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateStrategyWithWebSearch(businessData: any): Promise<StrategyResponse> {
    try {
      console.log('Calling backend strategy generation with web search...');
      
      const response = await fetch(`${this.baseUrl}/generate-strategy-with-search`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ businessData })
      });

      if (!response.ok) {
        console.log('Web search endpoint not available, falling back to regular strategy generation');
        return this.generateStrategy(businessData);
      }

      const data = await response.json();
      console.log('Strategy with web search generated successfully via backend');
      
      return data;
    } catch (error) {
      console.error('Backend web search strategy generation failed, falling back:', error);
      return this.generateStrategy(businessData);
    }
  }

  async generatePDF(businessData: any, strategyContent: string, options?: {
    includeCharts?: boolean;
    includeVisuals?: boolean;
  }): Promise<PDFResponse> {
    try {
      console.log('Calling backend PDF generation...');
      
      const response = await fetch(`${this.baseUrl}/generate-pdf`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          businessData,
          strategyContent,
          includeCharts: options?.includeCharts ?? true,
          includeVisuals: options?.includeVisuals ?? true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('PDF generated successfully via backend');
      
      return data;
    } catch (error) {
      console.error('Backend PDF generation failed:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sendStrategyEmail(
    email: string,
    businessData: any,
    strategyContent: string,
    pdfBase64?: string
  ): Promise<EmailResponse> {
    try {
      console.log('Calling backend email service...');
      
      // If no PDF provided, generate one from ChatGPT content
      let pdfToSend = pdfBase64;
      if (!pdfToSend && strategyContent) {
        try {
          console.log('Generating PDF from ChatGPT content for backend email...');
          const PDFService = await import('./pdfService');
          pdfToSend = await PDFService.default.generatePDFFromChatGPT(
            businessData,
            strategyContent,
            { includeCharts: true, includeVisuals: true }
          );
          console.log('PDF generated successfully for backend email');
        } catch (pdfError) {
          console.warn('Failed to generate PDF for backend email:', pdfError);
          // Continue without PDF
        }
      }
      
      const response = await fetch(`${this.baseUrl}/send-strategy-email`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          email,
          businessData,
          strategyContent,
          pdfBase64: pdfToSend
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Email sent successfully via backend');
      
      return data;
    } catch (error) {
      console.error('Backend email sending failed:', error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Health check for backend services
  async healthCheck(): Promise<boolean> {
    try {
      // Try to call a simple endpoint to check if backend is available
      const response = await fetch(`${this.baseUrl}/generate-strategy`, {
        method: 'OPTIONS',
        headers: this.headers
      });
      
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

export const backendService = new BackendService();