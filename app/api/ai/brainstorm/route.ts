import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAI, calculateCost } from '@/lib/ai/client';
import { validateBody } from '@/lib/validations/validate';
import { brainstormSchema } from '@/lib/validations/schemas';
import { withRateLimit } from '@/lib/api-utils';
import { AI_RATE_LIMIT } from '@/lib/rate-limit';

const BRAINSTORM_PROMPT = (topic: string) => `You are a creative brainstorming assistant. Generate 5-7 ideas or related thoughts about the following topic. Be creative, diverse, and practical.

Topic: ${topic}

Format your response as a numbered list of ideas, each with a brief explanation.`;

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
    const validation = validateBody(brainstormSchema, body);
    if (!validation.success) return validation.response;
    const { topic } = validation.data;

    // Call AI to brainstorm
    const prompt = BRAINSTORM_PROMPT(topic);
    const ideas = await callAI(prompt, 1000);

    // Log AI usage
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = Math.ceil(ideas.length / 4);
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      action: 'brainstorm',
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { topic },
      response: { ideas },
    } as any);

    return NextResponse.json({ ideas });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error brainstorming:', error);
    return NextResponse.json(
      { error: 'Failed to brainstorm' },
      { status: 500 }
    );
  }
}
