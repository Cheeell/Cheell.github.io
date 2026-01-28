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

const STRATEGY_PROMPT = `You are a senior marketing strategist with over 10 years of experience in B2B and B2C marketing, supporting startups, SMBs, and enterprise-level digital brands. Your role is to produce a highly detailed, research-backed, and professional-grade marketing strategy based on the information provided below.

Use real-world logic, data references where relevant, and expert-level insight. Your output should be structured, actionable, and easily digestible by non-marketers, while offering the depth and rigor expected by executives and investors.

Please format the response into the following expanded sections:

BUSINESS INFORMATION:
- Business Name: {{businessName}}
- Industry: {{industry}}
- Business Type: {{businessType}}
- Region of Operation: {{regionOfOperation}}
- Business Website: {{businessUrl}}
- Target Audience: {{targetAudience}}
- Current Revenue: {{currentRevenue}}
- Marketing Budget: {{marketingBudget}}
- Marketing Goals: {{marketingGoals}}
- Current Challenges: {{currentChallenges}}
- Main Competitors: {{competitorAnalysis}}
- Unique Value Proposition: {{uniqueValue}}
- Current Marketing Activities: {{currentMarketing}}
- Implementation Timeframe: {{timeframe}}
### 1. Executive Summary

Provide a compelling overview of the company including its name, website, business type, industry, area of operation, core service or product, unique value proposition, and strategic intent. Describe its current market position, brand visibility, and any critical challenges or growth goals. Highlight what this strategy aims to achieve and over what timeframe.

### 2. Market Overview (with Research)

Conduct a brief but insightful analysis of the {{industry}} sector in {{areaOfOperation}}. Include:

* Market size and growth projections (global or regional)
* Key drivers and inhibitors of growth
* Emerging technologies or consumer shifts
* How digital marketing trends impact this space

### 3. Competitor Landscape

Deeply analyze the company’s main competitors: {{competitorAnalysis}}
For each, detail:

* Brand positioning and messaging
* Visual and content tone
* Service offerings
* Key strengths and weaknesses
* Ad strategy or public presence (if known)
  Conclude with a competitive gap analysis and positioning opportunity for the business.

### 4. SWOT Analysis

Conduct a SWOT analysis for the business:

* Strengths
* Weaknesses
* Opportunities
* Threats
  Tailor the analysis to the digital presence, team, and market dynamics.

### 5. PESTEL Analysis

Assess the macro-environmental factors using a PESTEL framework for the business in {{areaOfOperation}}:

* Political
* Economic
* Social
* Technological
* Environmental
* Legal
  Explain how each factor might impact the marketing or operations.

### 6. Boston Consulting Group (BCG) Matrix

Classify the company's services or products using the BCG matrix:

* Stars
* Cash Cows
* Question Marks
* Dogs
  Explain each placement based on market growth and share.

### 7. Customer Profile & Targeting Strategy

Define one or two ideal customer personas based on: {{targetAudience}}
Include:

* Demographics (title, company size, age)
* Psychographics (motivation, mindset)
* Behavior (channels used, content consumed, buying patterns)
* Pain points and decision triggers
  Suggest how to target them through content and channels.

### 8. Strategic Positioning

Craft a positioning statement using the company’s unique value: {{uniqueValue}}
Define:

* Brand essence
* Tone and perception goals
* Competitive edge and promise
  Offer brand guidelines, visual suggestions, and brand voice tone.

### 9. Strategic Goals

Develop 3–5 SMART marketing goals from: {{marketingGoals}}
Each goal should include:

* Description
* Metric or KPI
* Deadline
* Strategic outcome (awareness, conversions, etc.)

### 10. Pillar Strategies (With Justification)

Recommend 3–5 core strategies suited to the company’s business type, stage, and marketing channels ({{currentMarketing}}). For each:

* Describe the activity
* Justify based on ROI or fit
* Give a sample frequency or workflow
* Estimate expected outcomes

### 11. Industry Trends & Opportunities

List 3–5 trends within the {{industry}} in {{areaOfOperation}} that could affect the company. For each:

* Describe the trend
* Label it as a threat, opportunity, or both
* Suggest specific actions to leverage or defend against it
### 12. Implementation Roadmap (3-Month Plan)

Create a 3-month tactical rollout plan ({{timeframe}}) formatted as a table. For each month, include:

* Key actions (e.g., setup tools, write content)
* Output goals (# posts, # leads, etc.)
* Roles responsible
* KPIs for progress
  Ensure it’s executable within {{marketingBudget}}.

### 13. Tactical Execution Plan

Deliver a step-by-step tactical guide:

* Marketing channels to focus on
* 3–5 sample campaigns (titles, messages, formats)
* Budget allocation for {{marketingBudget}}
* KPIs to track per channel
* Recommended tools and platforms (free & paid)
  Specify what to prioritize first for quick wins.

### 14. Risk Mitigation

Identify and plan for potential risks:

* Describe each risk (internal or external)
* Assign likelihood and potential impact
* Propose mitigation or contingency strategies
  Cover financial, operational, and reputational risks.

---
Expert, clear, and supportive. Avoid marketing jargon unless defined. Use bullet points, formatting, and examples to aid understanding.`;

function formatPromptWithData(businessData: BusinessData): string {
  let prompt = STRATEGY_PROMPT;
  
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

    console.log('Calling OpenAI API...');

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: "system",
            content: `You are a world-class marketing strategist with 15+ years of experience with web search capabilities. This is a premium $2,500+ consultation. 
            
            IMPORTANT: When a business website URL is provided, search and analyze the website to gather additional context about:
            - Their actual products/services and offerings
            - Current brand positioning and messaging
            - Visual identity and marketing approach
            - Target audience indicators from website design and content
            - Competitive positioning and unique selling propositions
            
            Use this web research combined with the provided business information to create an extremely comprehensive, detailed, and actionable marketing strategy that demonstrates deep expertise. Use approximately 6,000-8,000 words to ensure maximum value and detail. Every recommendation should be specific, actionable, and tailored to the business based on both survey responses AND website analysis.`
          },
          {
            role: "user",
            content: formattedPrompt
          }
        ],
        max_tokens: 8000,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to generate strategy' }),
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

    console.log('Strategy generated successfully');

    return new Response(
      JSON.stringify({
        content: strategy,
        usage: openaiData.usage,
        generatedAt: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-strategy function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})