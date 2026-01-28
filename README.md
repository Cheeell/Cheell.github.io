# Marketing Strategy SaaS Platform

An AI-powered platform that generates personalized marketing strategies for businesses through an intelligent questionnaire and ChatGPT integration.

## Features

- **Smart Questionnaire**: Multi-step form that collects comprehensive business information
- **AI Strategy Generation**: Integration with OpenAI's GPT-4 to create personalized marketing strategies (currently disabled for email testing)
- **Flexible Payment Options**: Configurable payment system that can be disabled for testing or free trials
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Email Delivery**: Send generated strategies directly to users' email
- **Professional Reports**: Well-structured strategy documents with actionable insights

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory and add your OpenAI API key:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=your_resend_api_key_here
VITE_FROM_EMAIL=noreply@yourdomain.com
```

### 3. Configure Payment Settings (Optional)

Edit `src/config/paymentConfig.ts` to customize payment behavior:

```typescript
export const PAYMENT_CONFIG: PaymentConfig = {
  enabled: true,              // Set to false to disable payment entirely
  skipPaymentForTesting: false, // Set to true for testing without payment
  freeTrialEnabled: false,    // Set to true to offer free trials
  // ... other settings
};
```

**Payment Modes:**
- **Required** (default): Users must pay before receiving strategy
- **Testing**: Skip payment during development/testing
- **Free Trial**: Offer free strategies to new users
- **Disabled**: Completely disable payment functionality

### 2. Setup Resend (for email delivery with PDF attachments)

1. Visit [Resend](https://resend.com/) and create a free account
2. Get your API key from the Resend dashboard
3. Verify your sending domain (or use Resend's test domain for development)
4. Add your API key to Supabase Edge Functions:
   ```bash
   supabase secrets set RESEND_API_KEY=re_your-resend-key
   supabase secrets set FROM_EMAIL=noreply@yourdomain.com
   ```

**Benefits of Resend:**
- ✅ Native PDF attachment support
- ✅ Better email deliverability
- ✅ Professional HTML email templates
- ✅ No complex template configuration needed
- ✅ 3,000 free emails per month

### 3. Get OpenAI API Key

**Note: OpenAI integration is currently disabled for email testing. Skip this step for now.**

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Add the key to Supabase Edge Functions when ready:
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-your-api-key
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

## Project Structure

```
src/
├── components/           # React components
│   ├── Header.tsx       # Navigation header
│   ├── Hero.tsx         # Landing page hero section
│   ├── Features.tsx     # Features showcase
│   ├── HowItWorks.tsx   # Process explanation
│   ├── Testimonials.tsx # Customer testimonials
│   ├── Questionnaire.tsx # Multi-step questionnaire
│   ├── StrategyResults.tsx # Results display
│   └── Footer.tsx       # Site footer
├── services/            # API services
│   └── openaiService.ts # OpenAI integration
│   └── emailService.ts  # Resend email service with PDF attachments
│   └── pdfService.ts    # Professional PDF generation
│   └── supabaseClient.ts # Database connection
├── prompts/             # AI prompts
│   └── strategyPrompt.ts # Marketing strategy prompt template
└── App.tsx              # Main application component
```

## How It Works

1. **Landing Page**: Users learn about the platform and its benefits
2. **Questionnaire**: 6-step form collects business information:
   - Business details (name, industry, type)
   - Target audience description
   - Budget and revenue information
   - Marketing goals and challenges
   - Competition and unique value proposition
   - Current marketing activities and timeline
3. **AI Processing**: Responses are sent to OpenAI with a detailed prompt
4. **Strategy Generation**: GPT-4 creates a comprehensive marketing strategy
5. **Results Display**: Users can preview and receive the full strategy via email

## Strategy Components

The AI generates strategies including:

- **Executive Summary**: Overview and key recommendations
- **Target Audience Analysis**: Demographics and psychographics
- **SWOT Analysis**: Strengths, weaknesses, opportunities, threats
- **Marketing Channels**: Recommended channels with budget allocation
- **Content Strategy**: Content themes and publishing recommendations
- **Implementation Timeline**: 6-month phased approach
- **KPIs**: Measurable success metrics
- **Competitive Positioning**: Differentiation strategies
- **Risk Mitigation**: Potential challenges and solutions
- **Next Steps**: Immediate action items

## Customization

### Modifying the AI Prompt

Edit `src/prompts/strategyPrompt.ts` to customize:
- Strategy structure and sections
- Industry-specific recommendations
- Output format and style
- Analysis depth and focus areas

### Adding New Questionnaire Steps

Modify `src/components/Questionnaire.tsx` to:
- Add new question categories
- Include additional form fields
- Implement conditional logic
- Customize validation rules

## Production Deployment

### Environment Variables for Production

Ensure these environment variables are set in your production environment:

```env
VITE_OPENAI_API_KEY=your_production_openai_api_key
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_RESEND_API_KEY=your_production_resend_api_key
VITE_FROM_EMAIL=noreply@yourdomain.com
```

### Security Considerations

**Important**: This implementation makes API calls directly from the browser for demonstration purposes. For production use, consider:

1. Move OpenAI API calls to a backend server
2. Move Resend email API calls to a backend server for better security
2. Implement proper authentication and rate limiting
3. Validate and sanitize user inputs
4. Use server-side environment variables for API keys
5. Implement proper error handling and logging

### Recommended Production Architecture

```
Frontend (React) → Backend API → OpenAI API + Resend API
                 ↓
              Supabase Database (user data, strategies)
                 ↓
              Email Service (PDF strategy delivery)
```

## API Usage and Costs

- **Model**: GPT-4 (configurable in `openaiService.ts`)
- **Average tokens per strategy**: 3,000-4,000 tokens
- **Estimated cost per strategy**: $0.12-$0.24 USD
- **Email delivery**: 3,000 free emails/month with Resend
- **Rate limits**: Respect OpenAI's rate limiting guidelines

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.