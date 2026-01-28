import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface BusinessData {
  businessName: string;
  industry: string;
  businessType: string;
  regionOfOperation: string;
  businessUrl: string;
  targetAudience: string;
  currentRevenue: string;
  marketingBudget: string;
  marketingGoals: string[];
  currentChallenges: string[];
  competitorAnalysis: string;
  uniqueValue: string;
  currentMarketing: string[];
  timeframe: string;
}

const ENHANCED_STRATEGY_PROMPT = `You are a senior marketing strategist with over 10 years of experience in B2B and B2C marketing, supporting startups, SMBs, and enterprise-level digital brands. You have access to web search capabilities to research businesses and their competitive landscape.

Your role is to produce a highly detailed, research-backed, and professional-grade marketing strategy based on the information provided below AND additional research you conduct on the business website.

BUSINESS INFORMATION:
- Business Name: {{businessName}}
- Industry: {{industry}}
- Business Type: {{businessType}}
- Region of Operation: {{regionOfOperation}}
- Business Website: {{businessUrl}}

RESEARCH INSTRUCTIONS:
If a business website URL is provided ({{businessUrl}}), please search and analyze the website to gather comprehensive information about:

1. **Products/Services Analysis:**
   - What specific products or services do they offer?
   - How are they positioned and priced?
   - What is their value proposition?

2. **Brand Analysis:**
   - What is their current brand messaging and tone?
   - How do they present themselves visually?
   - What is their brand personality?

3. **Marketing Analysis:**
   - What marketing channels are they currently using?
   - What type of content do they create?
   - How do they engage with customers?

4. **Competitive Analysis:**
   - How do they position against competitors?
   - What makes them unique in their market?
   - What are their competitive advantages?

5. **Target Audience Indicators:**
   - Who appears to be their target audience based on website design and content?
   - What customer testimonials or case studies do they feature?
   - What language and imagery do they use?

ADDITIONAL SURVEY DATA:
- Target Audience: {{targetAudience}}
- Current Revenue: {{currentRevenue}}
- Marketing Budget: {{marketingBudget}}
- Marketing Goals: {{marketingGoals}}
- Current Challenges: {{currentChallenges}}
- Main Competitors: {{competitorAnalysis}}
- Unique Value Proposition: {{uniqueValue}}
- Current Marketing Activities: {{currentMarketing}}
- Implementation Timeframe: {{timeframe}}

STRATEGY REQUIREMENTS:
Use real-world logic, data references where relevant, and expert-level insight. Your output should be structured, actionable, and easily digestible by non-marketers, while offering the depth and rigor expected by executives and investors.

Combine your website research findings with the survey data to create a comprehensive strategy that addresses:

### 1. Executive Summary
Provide a compelling overview incorporating website analysis findings and survey data.

### 2. Website & Brand Analysis
Detail your findings from analyzing their website, including strengths, weaknesses, and opportunities for improvement.

### 3. Market Overview (with Research)
Conduct analysis of the {{industry}} sector in {{regionOfOperation}} with current market data.

### 4. Enhanced Competitor Landscape
Analyze competitors mentioned in survey plus any discovered through website research.

### 5. SWOT Analysis
Comprehensive SWOT based on both website analysis and survey responses.

### 6. PESTEL Analysis
Macro-environmental factors assessment for {{regionOfOperation}}.

### 7. Customer Profile & Targeting Strategy
Refined customer personas based on website indicators and survey data.

### 8. Strategic Positioning
Enhanced positioning strategy incorporating website brand analysis.

### 9. Strategic Goals
SMART marketing goals aligned with survey responses and website capabilities.

### 10. Pillar Strategies (With Justification)
Strategies that build on current website/marketing foundation while addressing survey goals.

### 11. Website & Digital Presence Optimization
Specific recommendations for improving their website and digital presence based on analysis.

### 12. Implementation Roadmap (3-Month Plan)
Tactical rollout plan considering current website/marketing maturity level.

### 13. Tactical Execution Plan
Step-by-step guide with budget allocation for {{marketingBudget}}.

### 14. Risk Mitigation
Risk assessment including digital/website-related risks.

---
Be expert, clear, and supportive. Use your website research to provide specific, actionable recommendations that build on their existing foundation while addressing their stated goals and challenges.`;

function formatPromptWithData(businessData: BusinessData): string {
  let prompt = ENHANCED_STRATEGY_PROMPT;
  
  const replacements = {
    '{{businessName}}': businessData.businessName || 'Not specified',
    '{{industry}}': businessData.industry || 'Not specified',
    '{{businessType}}': businessData.businessType || 'Not specified',
    '{{regionOfOperation}}': businessData.regionOfOperation || 'Not specified',
    '{{businessUrl}}': businessData.businessUrl || 'Not specified',
    '{{targetAudience}}': businessData.targetAudience || 'Not specified',
    '{{currentRevenue}}': businessData.currentRevenue || 'Not specified',
    '{{marketingBudget}}': businessData.marketingBudget || 'Not specified',
    '{{marketingGoals}}': Array.isArray(businessData.marketingGoals) 
      ? businessData.marketingGoals.join(', ') 
      : 'Not specified',
    '{{currentChallenges}}': Array.isArray(businessData.currentChallenges) 
      ? businessData.currentChallenges.join(', ') 
      : 'Not specified',
    '{{competitorAnalysis}}': businessData.competitorAnalysis || 'Not specified',
    '{{uniqueValue}}': businessData.uniqueValue || 'Not specified',
    '{{currentMarketing}}': Array.isArray(businessData.currentMarketing) 
      ? businessData.currentMarketing.join(', ') 
      : 'Not specified',
    '{{timeframe}}': businessData.timeframe || 'Not specified'
  };

  Object.entries(replacements).forEach(([placeholder, value]) => {
    prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
  });

  return prompt;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { businessData } = await req.json()

    if (!businessData) {
      return new Response(
        JSON.stringify({ error: 'Business data is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format the prompt with business data
    const formattedPrompt = formatPromptWithData(businessData);

    console.log('Calling OpenAI API with web search capabilities...');
    console.log('Business URL to analyze:', businessData.businessUrl);

    // Call OpenAI API with enhanced web search capabilities
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Use GPT-4o which has better web search capabilities
        messages: [
          {
            role: "system",
            content: `You are a world-class marketing strategist with 15+ years of experience and web search capabilities. This is a premium $2,500+ consultation. 
            
            CRITICAL: You have the ability to search and analyze websites. When provided with a business website URL, you MUST:
            1. Visit and thoroughly analyze the website
            2. Extract key information about their products, services, branding, and positioning
            3. Identify their current marketing approach and target audience indicators
            4. Assess their competitive positioning and unique value propositions
            5. Note any strengths or weaknesses in their current digital presence
            
            Use this website analysis combined with the survey data to provide an extremely comprehensive, detailed, and actionable marketing strategy that demonstrates deep expertise. Use approximately 6,000-8,000 words to ensure maximum value and detail. Every recommendation should be specific, actionable, and tailored to the business based on BOTH the survey responses AND your website analysis.
            
            If you cannot access the website, clearly state this and proceed with the survey data alone, but always attempt to search for and analyze the provided URL first.`
          },
          {
            role: "user",
            content: formattedPrompt
          }
        ],
        max_tokens: 8000,
        temperature: 0.7,
        tools: [
          {
            type: "function",
            function: {
              name: "web_search",
              description: "Search the web for information about a business website",
              parameters: {
                type: "object",
                properties: {
                  url: {
                    type: "string",
                    description: "The website URL to analyze"
                  },
                  query: {
                    type: "string", 
                    description: "Search query to find information about the business"
                  }
                },
                required: ["url"]
              }
            }
          }
        ],
        tool_choice: "auto"
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to generate strategy with web search' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openaiData = await openaiResponse.json()
    const strategy = openaiData.choices[0]?.message?.content

    if (!strategy) {
      return new Response(
        JSON.stringify({ error: 'No strategy generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Store the strategy generation in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update email record with strategy generated
    if (businessData.email) {
      await supabase
        .from('emails')
        .update({ 
          strategy_generated: true,
          survey_data: businessData 
        })
        .eq('email', businessData.email)
    }

    console.log('Enhanced strategy with web search generated successfully');

    return new Response(
      JSON.stringify({
        content: strategy,
        usage: openaiData.usage,
        generatedAt: new Date().toISOString(),
        websiteAnalyzed: businessData.businessUrl ? true : false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-strategy-with-search function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})