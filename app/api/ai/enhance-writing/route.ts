import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAI, calculateCost } from '@/lib/ai/client';
import { ENHANCE_WRITING_PROMPT } from '@/lib/ai/prompts';
import { validateBody } from '@/lib/validations/validate';
import { enhanceWritingSchema } from '@/lib/validations/schemas';
import { withRateLimit } from '@/lib/api-utils';
import { AI_RATE_LIMIT } from '@/lib/rate-limit';

type EnhanceAction = 'continue' | 'improve' | 'summarize' | 'outline' | 'expand';

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
    const validation = validateBody(enhanceWritingSchema, body);
    if (!validation.success) return validation.response;
    const { content, action } = validation.data;

    // Build prompt and call AI
    const prompt = ENHANCE_WRITING_PROMPT(content, action);
    const result = await callAI(prompt, 1500);

    // Log AI usage
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = Math.ceil(result.length / 4);
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      action: `enhance_${action}`,
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { content_length: content.length, action },
      response: { result_length: result.length },
    } as any);

    return NextResponse.json({ result });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error in enhance writing:', error);
    return NextResponse.json(
      { error: 'Failed to enhance writing' },
      { status: 500 }
    );
  }
}
