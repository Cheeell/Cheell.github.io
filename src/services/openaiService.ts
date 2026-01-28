import OpenAI from 'openai';
import { formatPromptWithData } from '../prompts/strategyPrompt';
import { AI_CONFIG, shouldUseChatGPT, getOpenAIModel } from '../config/aiConfig';
import { backendService } from './backendService';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from backend
});

export interface StrategyResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const generateMarketingStrategyWithWebSearch = async (businessData: any): Promise<StrategyResponse> => {
  try {
    // Check if ChatGPT is enabled in configuration
    if (!shouldUseChatGPT()) {
      throw new Error('ChatGPT is disabled in configuration or API key is missing');
    }

    // Use backend service for strategy generation
    console.log('Using Supabase backend for strategy generation...');
    return await backendService.generateStrategyWithWebSearch(businessData);
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    if (error instanceof Error) {
      // Handle specific OpenAI errors
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API key is missing or invalid. Please check your environment variables.');
      } else if (error.message.includes('insufficient_quota')) {
        throw new Error('OpenAI API quota exceeded. Please check your usage limits or add credits to your account.');
      } else if (error.message.includes('quota')) {
        throw new Error('OpenAI API quota exceeded. Please check your usage limits.');
      } else if (error.message.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.message.includes('model_not_found')) {
        throw new Error('The requested model (GPT-4) is not available. Please check your OpenAI account access or upgrade to access GPT-4.');
      } else if (error.message.includes('context_length_exceeded')) {
        throw new Error('The strategy request is too long. Please try with shorter business descriptions.');
      }
    }
    
    throw new Error(`Failed to generate marketing strategy: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to parse the structured response
export const parseStrategyResponse = (content: string) => {
  const sections = {
    executiveSummary: '',
    targetAudience: '',
    swotAnalysis: '',
    recommendedChannels: '',
    contentStrategy: '',
    budgetAllocation: '',
    implementationTimeline: '',
    kpis: '',
    competitivePositioning: '',
    riskMitigation: '',
    nextSteps: ''
  };

  // Simple parsing logic - you can make this more sophisticated
  const lines = content.split('\n');
  let currentSection = '';
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    if (trimmedLine.includes('EXECUTIVE SUMMARY')) {
      currentSection = 'executiveSummary';
    } else if (trimmedLine.includes('TARGET AUDIENCE')) {
      currentSection = 'targetAudience';
    } else if (trimmedLine.includes('SWOT ANALYSIS')) {
      currentSection = 'swotAnalysis';
    } else if (trimmedLine.includes('RECOMMENDED MARKETING CHANNELS')) {
      currentSection = 'recommendedChannels';
    } else if (trimmedLine.includes('CONTENT STRATEGY')) {
      currentSection = 'contentStrategy';
    } else if (trimmedLine.includes('BUDGET ALLOCATION')) {
      currentSection = 'budgetAllocation';
    } else if (trimmedLine.includes('IMPLEMENTATION TIMELINE')) {
      currentSection = 'implementationTimeline';
    } else if (trimmedLine.includes('KEY PERFORMANCE INDICATORS')) {
      currentSection = 'kpis';
    } else if (trimmedLine.includes('COMPETITIVE POSITIONING')) {
      currentSection = 'competitivePositioning';
    } else if (trimmedLine.includes('RISK MITIGATION')) {
      currentSection = 'riskMitigation';
    } else if (trimmedLine.includes('NEXT STEPS')) {
      currentSection = 'nextSteps';
    } else if (currentSection && trimmedLine) {
      sections[currentSection as keyof typeof sections] += line + '\n';
    }
  });

  return {
    ...sections,
    fullContent: content
  };
};