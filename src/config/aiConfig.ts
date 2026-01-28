// AI Configuration Settings
export interface AIConfig {
  useChatGPT: boolean;
  openaiModel: 'gpt-4' | 'gpt-3.5-turbo';
  maxTokens: number;
  temperature: number;
}

// Main configuration - Change useChatGPT to false to disable AI and use mock data
export const AI_CONFIG: AIConfig = {
  // Set to FALSE to use mock strategy generation (no API calls)
  // Set to TRUE to use real ChatGPT/OpenAI API
  useChatGPT: true,
  
  // OpenAI model to use (gpt-4 is more expensive but higher quality)
  openaiModel: 'gpt-4',
  
  // Maximum tokens for the response
  maxTokens: 8000,
  
  // Temperature for creativity (0.0 = deterministic, 1.0 = very creative)
  temperature: 0.7
};

// Helper function to check if ChatGPT should be used
export const shouldUseChatGPT = (): boolean => {
  // Check if ChatGPT is enabled in config AND API key is available
  // Note: API key is now handled by backend, so we only check config
  return AI_CONFIG.useChatGPT;
};

// Helper function to get the current model
export const getOpenAIModel = (): string => {
  return AI_CONFIG.openaiModel;
};

// Helper function to check if we're in development mode
export const isDevelopmentMode = (): boolean => {
  return !AI_CONFIG.useChatGPT || !import.meta.env.VITE_OPENAI_API_KEY;
};