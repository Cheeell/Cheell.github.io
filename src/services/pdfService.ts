import jsPDF from 'jspdf';
import { backendService } from './backendService';

interface BusinessData {
  businessName?: string;
  industry?: string;
  businessType?: string;
  targetAudience?: string;
  currentRevenue?: string;
  marketingBudget?: string;
  marketingGoals?: string[];
  currentChallenges?: string[];
  competitorAnalysis?: string;
  uniqueValue?: string;
  currentMarketing?: string[];
  timeframe?: string;
  email?: string;
}

interface GeneratePDFOptions {
  businessData: BusinessData;
  strategyContent: string;
  includeCharts?: boolean;
  includeVisuals?: boolean;
}

class EnhancedPDFService {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;
  private colors = {
    primary: [59, 130, 246], // Blue-600
    secondary: [107, 114, 128], // Gray-500
    accent: [147, 51, 234], // Purple-600
    success: [34, 197, 94], // Green-500
    text: [17, 24, 39], // Gray-900
    lightText: [75, 85, 99], // Gray-600
    background: [248, 250, 252], // Gray-50
    white: [255, 255, 255]
  };

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
  }

  private checkPageBreak(requiredSpace: number = 25): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.addPage();
    }
  }

  private addPage(): void {
    this.pdf.addPage();
    this.currentY = this.margin;
    this.addPageHeader();
  }

  private addPageHeader(): void {
    // Add subtle header on subsequent pages
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(...this.colors.lightText);
    this.pdf.text('StrategyAI - Marketing Strategy Report', this.margin, 15);
    
    // Add page number
    const pageNum = this.pdf.getCurrentPageInfo().pageNumber;
    this.pdf.text(`Page ${pageNum}`, this.pageWidth - this.margin - 20, 15);
    
    // Add separator line
    this.pdf.setDrawColor(...this.colors.primary);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, 18, this.pageWidth - this.margin, 18);
    
    this.currentY = 25;
  }

  private addGradientBackground(x: number, y: number, width: number, height: number): void {
    // Simulate gradient with multiple rectangles
    const steps = 20;
    const stepHeight = height / steps;
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const r = Math.round(this.colors.primary[0] + (this.colors.accent[0] - this.colors.primary[0]) * ratio);
      const g = Math.round(this.colors.primary[1] + (this.colors.accent[1] - this.colors.primary[1]) * ratio);
      const b = Math.round(this.colors.primary[2] + (this.colors.accent[2] - this.colors.primary[2]) * ratio);
      
      this.pdf.setFillColor(r, g, b);
      this.pdf.rect(x, y + (i * stepHeight), width, stepHeight, 'F');
    }
  }

  private addTitle(text: string, fontSize: number = 20, color: number[] = this.colors.text): void {
    this.checkPageBreak(15);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(...color);
    this.pdf.text(text, this.margin, this.currentY);
    this.currentY += fontSize * 0.8;
  }

  private addSubtitle(text: string, fontSize: number = 16, color: number[] = this.colors.secondary): void {
    this.checkPageBreak(12);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(...color);
    this.pdf.text(text, this.margin, this.currentY);
    
    // Add underline
    const textWidth = this.pdf.getTextWidth(text);
    this.pdf.setDrawColor(...this.colors.primary);
    this.pdf.setLineWidth(0.8);
    this.pdf.line(this.margin, this.currentY + 2, this.margin + textWidth, this.currentY + 2);
    
    this.currentY += fontSize * 0.8 + 5;
  }

  private addParagraph(text: string, fontSize: number = 11, color: number[] = this.colors.text): void {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(...color);
    
    const maxWidth = this.pageWidth - (this.margin * 2);
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    
    for (let i = 0; i < lines.length; i++) {
      this.checkPageBreak(8);
      this.pdf.text(lines[i], this.margin, this.currentY);
      this.currentY += fontSize * 0.5;
    }
    
    this.currentY += 6;
  }

  private addBulletPoint(text: string, fontSize: number = 10, indent: number = 5): void {
    this.checkPageBreak(8);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(...this.colors.text);
    
    // Add bullet
    this.pdf.setFillColor(...this.colors.primary);
    this.pdf.circle(this.margin + indent, this.currentY - 2, 1, 'F');
    
    // Add text
    const maxWidth = this.pageWidth - (this.margin * 2) - indent - 5;
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) this.checkPageBreak(6);
      this.pdf.text(lines[i], this.margin + indent + 5, this.currentY);
      this.currentY += fontSize * 0.6;
    }
    
    this.currentY += 2;
  }

  private addInfoBox(title: string, content: string, bgColor: number[] = this.colors.background): void {
    this.checkPageBreak(30);
    
    const boxHeight = Math.max(25, Math.ceil(content.length / 80) * 8 + 15);
    const boxY = this.currentY;
    
    // Background
    this.pdf.setFillColor(...bgColor);
    this.pdf.roundedRect(this.margin, boxY, this.pageWidth - (this.margin * 2), boxHeight, 3, 3, 'F');
    
    // Border
    this.pdf.setDrawColor(...this.colors.primary);
    this.pdf.setLineWidth(0.5);
    this.pdf.roundedRect(this.margin, boxY, this.pageWidth - (this.margin * 2), boxHeight, 3, 3, 'S');
    
    // Title
    this.currentY = boxY + 8;
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text(title, this.margin + 5, this.currentY);
    
    // Content
    this.currentY += 6;
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(...this.colors.text);
    
    const maxWidth = this.pageWidth - (this.margin * 2) - 10;
    const lines = this.pdf.splitTextToSize(content, maxWidth);
    
    for (let i = 0; i < lines.length; i++) {
      if (this.currentY > boxY + boxHeight - 5) break;
      this.pdf.text(lines[i], this.margin + 5, this.currentY);
      this.currentY += 5;
    }
    
    this.currentY = boxY + boxHeight + 10;
  }

  private addCoverPage(businessData: BusinessData): void {
    // Gradient background for header
    this.addGradientBackground(0, 0, this.pageWidth, 80);
    
    // Main title
    this.pdf.setFontSize(32);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.text('MARKETING STRATEGY', this.pageWidth / 2, 35, { align: 'center' });
    
    // Subtitle
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(255, 255, 255, 0.9);
    this.pdf.text('AI-Powered Business Analysis & Recommendations', this.pageWidth / 2, 50, { align: 'center' });
    
    // Business name with accent
    if (businessData.businessName) {
      this.pdf.setFontSize(28);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(...this.colors.primary);
      this.pdf.text(businessData.businessName, this.pageWidth / 2, 100, { align: 'center' });
    }
    
    // Date
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...this.colors.lightText);
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    this.pdf.text(`Generated on ${date}`, this.pageWidth / 2, 120, { align: 'center' });
    
    // Business overview section
    this.currentY = 140;
    this.addTitle('Business Overview', 18, this.colors.primary);
    
    const businessInfo = [
      { label: 'Industry', value: businessData.industry },
      { label: 'Business Type', value: businessData.businessType },
      { label: 'Current Revenue', value: businessData.currentRevenue },
      { label: 'Marketing Budget', value: businessData.marketingBudget }
    ].filter(item => item.value);
    
    // Create info grid
    const cols = 2;
    const colWidth = (this.pageWidth - (this.margin * 2)) / cols;
    let col = 0;
    let row = 0;
    
    businessInfo.forEach((info, index) => {
      const x = this.margin + (col * colWidth);
      const y = this.currentY + (row * 25);
      
      // Info box
      this.pdf.setFillColor(...this.colors.white);
      this.pdf.roundedRect(x, y, colWidth - 5, 20, 2, 2, 'F');
      
      this.pdf.setDrawColor(...this.colors.primary);
      this.pdf.setLineWidth(0.3);
      this.pdf.roundedRect(x, y, colWidth - 5, 20, 2, 2, 'S');
      
      // Label
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(...this.colors.lightText);
      this.pdf.text(info.label.toUpperCase(), x + 3, y + 8);
      
      // Value
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(...this.colors.text);
      this.pdf.text(info.value || 'Not specified', x + 3, y + 15);
      
      col++;
      if (col >= cols) {
        col = 0;
        row++;
      }
    });
    
    this.currentY += Math.ceil(businessInfo.length / cols) * 25 + 20;
    
    // Target audience highlight
    if (businessData.targetAudience) {
      this.addInfoBox('Target Audience', businessData.targetAudience);
    }
    
    // Footer
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...this.colors.lightText);
    this.pdf.text('© 2024 StrategyAI. All rights reserved.', this.pageWidth / 2, this.pageHeight - 20, { align: 'center' });
    
    this.addPage();
  }

  private parseAndAddContent(content: string): void {
    const lines = content.split('\n');
    let inList = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed) {
        if (inList) {
          inList = false;
          this.currentY += 5;
        } else {
          this.currentY += 3;
        }
        continue;
      }
      
      // Main headers (##)
      if (trimmed.startsWith('## ')) {
        inList = false;
        this.currentY += 10;
        this.addTitle(trimmed.replace('## ', ''), 18, this.colors.primary);
      }
      // Sub headers (###)
      else if (trimmed.startsWith('### ')) {
        inList = false;
        this.addSubtitle(trimmed.replace('### ', ''), 14, this.colors.secondary);
      }
      // Single # headers
      else if (trimmed.startsWith('# ')) {
        inList = false;
        this.currentY += 15;
        this.addTitle(trimmed.replace('# ', ''), 20, this.colors.primary);
      }
      // Bullet points
      else if (trimmed.startsWith('- ')) {
        if (!inList) {
          inList = true;
          this.currentY += 3;
        }
        this.addBulletPoint(trimmed.replace('- ', ''));
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(trimmed)) {
        if (!inList) {
          inList = true;
          this.currentY += 3;
        }
        this.addBulletPoint(trimmed.replace(/^\d+\.\s/, ''));
      }
      // Bold text (markdown **text**)
      else if (trimmed.includes('**')) {
        inList = false;
        const boldText = trimmed.replace(/\*\*(.*?)\*\*/g, '$1');
        this.pdf.setFont('helvetica', 'bold');
        this.addParagraph(boldText, 11, this.colors.text);
        this.pdf.setFont('helvetica', 'normal');
      }
      // Regular paragraphs
      else {
        inList = false;
        this.addParagraph(trimmed);
      }
    }
  }

  async generateStrategyPDF(options: GeneratePDFOptions): Promise<string> {
    try {
      const { businessData, strategyContent } = options;
      
      console.log('Generating enhanced PDF for:', businessData.businessName);
      
      // Add cover page
      this.addCoverPage(businessData);
      
      // Add content with enhanced formatting
      this.parseAndAddContent(strategyContent);
      
      // Add professional footer on last page
      this.currentY = this.pageHeight - 40;
      
      // Footer section
      this.pdf.setDrawColor(...this.colors.primary);
      this.pdf.setLineWidth(1);
      this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
      
      this.currentY += 10;
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(...this.colors.primary);
      this.pdf.text('StrategyAI', this.pageWidth / 2, this.currentY, { align: 'center' });
      
      this.currentY += 8;
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(...this.colors.lightText);
      this.pdf.text('Professional Marketing Strategy Report', this.pageWidth / 2, this.currentY, { align: 'center' });
      
      this.currentY += 5;
      this.pdf.text(`This comprehensive strategy was generated using advanced AI analysis`, this.pageWidth / 2, this.currentY, { align: 'center' });
      
      this.currentY += 4;
      this.pdf.text(`tailored specifically for ${businessData.businessName || 'your business'}.`, this.pageWidth / 2, this.currentY, { align: 'center' });
      
      // Return clean base64 for email attachment
      const pdfBase64 = this.pdf.output('datauristring');
      const cleanBase64 = pdfBase64.split(',')[1];
      
      console.log('Enhanced PDF generated successfully:', {
        totalLength: pdfBase64.length,
        base64Length: cleanBase64.length,
        preview: cleanBase64.substring(0, 50) + '...'
      });
      
      return cleanBase64;
      
    } catch (error) {
      console.error('Error generating enhanced PDF:', error);
      throw new Error('Failed to generate enhanced PDF report');
    }
  }
  
  // Method to download PDF directly (for the download button)
  downloadPDF(options: GeneratePDFOptions): void {
    try {
      const { businessData, strategyContent } = options;
      
      // Create new PDF instance for download
      const downloadPdf = new jsPDF('p', 'mm', 'a4');
      const service = new EnhancedPDFService();
      service.pdf = downloadPdf;
      
      // Add content
      service.addCoverPage(businessData);
      service.parseAndAddContent(strategyContent);
      
      // Generate filename and download
      const fileName = `${businessData.businessName || 'Business'}_Marketing_Strategy_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPdf.save(fileName);
      
      console.log('Enhanced PDF downloaded successfully:', fileName);
      
    } catch (error) {
      console.error('Error downloading enhanced PDF:', error);
      throw new Error('Failed to download enhanced PDF report');
    }
  }
}

// Enhanced PDF Service with better ChatGPT content parsing
class ChatGPTToPDFService {
  static async generatePDFFromChatGPT(
    businessData: BusinessData,
    chatGPTResponse: string,
    options?: { includeCharts?: boolean; includeVisuals?: boolean }
  ): Promise<string> {
    try {
      console.log('Converting ChatGPT response to PDF...');
      
      // Clean and format ChatGPT response
      const cleanedContent = ChatGPTToPDFService.cleanChatGPTContent(chatGPTResponse);
      
      // Use enhanced PDF service
      const service = new EnhancedPDFService();
      return await service.generateStrategyPDF({
        businessData,
        strategyContent: cleanedContent,
        includeCharts: options?.includeCharts ?? true,
        includeVisuals: options?.includeVisuals ?? true
      });
      
    } catch (error) {
      console.error('Error converting ChatGPT to PDF:', error);
      throw new Error(`Failed to convert ChatGPT response to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static cleanChatGPTContent(content: string): string {
    // Remove any unwanted prefixes or suffixes from ChatGPT
    let cleaned = content.trim();
    
    // Remove common ChatGPT response patterns
    cleaned = cleaned.replace(/^(Here's|Here is|I'll provide|Based on).+?:\s*/i, '');
    cleaned = cleaned.replace(/^(Certainly|Of course|Sure).+?:\s*/i, '');
    
    // Clean up markdown formatting issues
    cleaned = cleaned.replace(/\*\*\*(.+?)\*\*\*/g, '**$1**'); // Triple asterisks to double
    cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '**$1**'); // Ensure proper bold formatting
    
    // Fix header formatting
    cleaned = cleaned.replace(/^#+\s*/gm, (match) => {
      const level = match.trim().length;
      return level <= 2 ? '## ' : '### ';
    });
    
    // Ensure proper spacing between sections
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Remove any trailing whitespace
    cleaned = cleaned.replace(/\s+$/gm, '');
    
    return cleaned;
  }

  static async downloadChatGPTPDF(
    businessData: BusinessData,
    chatGPTResponse: string,
    options?: { includeCharts?: boolean; includeVisuals?: boolean }
  ): Promise<void> {
    try {
      const cleanedContent = ChatGPTToPDFService.cleanChatGPTContent(chatGPTResponse);
      
      const service = new EnhancedPDFService();
      service.downloadPDF({
        businessData,
        strategyContent: cleanedContent,
        includeCharts: options?.includeCharts ?? true,
        includeVisuals: options?.includeVisuals ?? true
      });
      
    } catch (error) {
      console.error('Error downloading ChatGPT PDF:', error);
      throw new Error(`Failed to download ChatGPT PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

const PDFService = {
  generateStrategyPDF: async (options: GeneratePDFOptions): Promise<string> => {
    try {
      console.log('Generating enhanced PDF with professional design...');
      
      // Try backend service first, fallback to client-side
      try {
        const backendResult = await backendService.generatePDF(
          options.businessData,
          options.strategyContent,
          {
            includeCharts: options.includeCharts,
            includeVisuals: options.includeVisuals
          }
        );
        console.log('PDF generated via backend service');
        return backendResult.pdfBase64;
      } catch (backendError) {
        console.warn('Backend PDF generation failed, using client-side fallback:', backendError);
        
        // Fallback to enhanced client-side PDF generation
        const service = new EnhancedPDFService();
        return service.generateStrategyPDF(options);
      }
      
    } catch (error) {
      console.error('Enhanced PDF generation failed:', error);
      throw new Error(`Failed to generate enhanced PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  // ChatGPT specific methods
  generatePDFFromChatGPT: ChatGPTToPDFService.generatePDFFromChatGPT,
  downloadChatGPTPDF: ChatGPTToPDFService.downloadChatGPTPDF,
  
  // Export the enhanced service class for direct use
  EnhancedPDFService,
  ChatGPTToPDFService
};

export default PDFService;