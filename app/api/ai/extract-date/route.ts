import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAIWithJSON, calculateCost } from '@/lib/ai/client';
import { EXTRACT_DATE_PROMPT } from '@/lib/ai/prompts';
import { validateBody } from '@/lib/validations/validate';
import { extractDateSchema } from '@/lib/validations/schemas';
import { withRateLimit } from '@/lib/api-utils';
import { AI_RATE_LIMIT } from '@/lib/rate-limit';

interface DateResponse {
  has_date: boolean;
  date: string | null;
  time: string | null;
  is_all_day: boolean;
  cleaned_text: string;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit
    const rateCheck = withRateLimit(user.id, AI_RATE_LIMIT, 'ai');
    if (!rateCheck.allowed) return rateCheck.response;

    // Validate request body
    const body = await request.json();
    const validation = validateBody(extractDateSchema, body);
    if (!validation.success) return validation.response;
    const { text } = validation.data;

    // Call AI to extract date
    const prompt = EXTRACT_DATE_PROMPT(text);
    const result = await callAIWithJSON<DateResponse>(prompt);

    // Log AI usage
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = 50;
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      action: 'extract_date',
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { text },
      response: result,
    } as any);

    return NextResponse.json(result);
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error extracting date:', error);
    return NextResponse.json(
      { error: 'Failed to extract date' },
      { status: 500 }
    );
  }
}
